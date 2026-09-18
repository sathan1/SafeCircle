import os
import zipfile
import subprocess
import shutil

def patch_apk():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_apk = os.path.join(base_dir, "SafeCircle-debug (2).apk")
    temp_apk = os.path.join(base_dir, "temp_unsigned.apk")
    output_apk = os.path.join(base_dir, "SafeCircle-working-debug.apk")
    dist_dir = os.path.join(base_dir, "frontend", "dist")
    keystore = os.path.join(base_dir, "debug.keystore")
    jarsigner = r"C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot\bin\jarsigner.exe"

    if not os.path.exists(input_apk):
        print(f"Error: {input_apk} not found")
        return

    print("Step 1: Reading input APK and filtering old assets/signatures...")
    with zipfile.ZipFile(input_apk, 'r') as zin, zipfile.ZipFile(temp_apk, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            # Skip old public web assets, capacitor config, and signature files
            if item.filename.startswith("assets/public/"):
                continue
            if item.filename == "assets/capacitor.config.json":
                continue
            if item.filename.startswith("META-INF/") and (
                item.filename.endswith(".SF") or
                item.filename.endswith(".RSA") or
                item.filename.endswith(".DSA") or
                item.filename.endswith(".MF")
            ):
                continue
            
            # Keep everything else (classes*.dex, resources, native libs, res, AndroidManifest, etc.)
            buffer = zin.read(item.filename)
            zout.writestr(item, buffer)

        print("Step 2: Injecting freshly built frontend/dist assets...")
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir).replace("\\", "/")
                apk_path = f"assets/public/{rel_path}"
                with open(full_path, "rb") as f:
                    zout.writestr(apk_path, f.read())

        print("Step 3: Injecting updated capacitor.config.json with cleartext enabled...")
        cap_config = (
            '{\n'
            '\t"appId": "com.safecircle.app",\n'
            '\t"appName": "SafeCircle",\n'
            '\t"webDir": "dist",\n'
            '\t"bundledWebRuntime": false,\n'
            '\t"server": {\n'
            '\t\t"androidScheme": "https",\n'
            '\t\t"cleartext": true\n'
            '\t}\n'
            '}'
        )
        zout.writestr("assets/capacitor.config.json", cap_config)

    print("Step 4: Signing APK with debug keystore using jarsigner...")
    if os.path.exists(output_apk):
        os.remove(output_apk)
    shutil.copyfile(temp_apk, output_apk)
    os.remove(temp_apk)

    sign_cmd = [
        jarsigner,
        "-sigalg", "SHA256withRSA",
        "-digestalg", "SHA-256",
        "-keystore", keystore,
        "-storepass", "android",
        "-keypass", "android",
        output_apk,
        "androiddebugkey"
    ]
    res = subprocess.run(sign_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Signing failed:", res.stderr)
        return
    print("Signing output:", res.stdout.strip())

    print("Step 5: Verifying APK signature...")
    verify_cmd = [jarsigner, "-verify", output_apk]
    vres = subprocess.run(verify_cmd, capture_output=True, text=True)
    print("Verification:", vres.stdout.strip())

    # Also update SafeCircle-debug (2).apk so the user's specific file works
    shutil.copyfile(output_apk, input_apk)
    print(f"SUCCESS: Both {output_apk} and {input_apk} have been updated and signed!")

if __name__ == "__main__":
    patch_apk()
