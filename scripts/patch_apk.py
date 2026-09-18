import os
import zipfile
import subprocess
import shutil

def patch_apk():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_apk = os.path.join(base_dir, "SafeCircle-debug (2).apk")
    temp_apk = os.path.join(base_dir, "temp_unaligned.apk")
    output_apk = os.path.join(base_dir, "SafeCircle-working-debug.apk")
    dist_dir = os.path.join(base_dir, "frontend", "dist")
    signer_jar = os.path.join(base_dir, "scripts", "uber-apk-signer.jar")
    java_exe = r"C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot\bin\java.exe"

    if not os.path.exists(input_apk):
        print(f"Error: {input_apk} not found")
        return

    if not os.path.exists(dist_dir):
        print(f"Error: {dist_dir} not found. Run npm run build first.")
        return

    print("Step 1: Reading input APK and filtering old assets/signatures...")
    with zipfile.ZipFile(input_apk, 'r') as zin, zipfile.ZipFile(temp_apk, 'w') as zout:
        for item in zin.infolist():
            # Skip old public web assets, capacitor config, and signature files
            if item.filename.startswith("assets/public/"):
                continue
            if item.filename == "assets/capacitor.config.json":
                continue
            if item.filename.startswith("META-INF/"):
                # Skip signatures and hashes so uber-apk-signer creates clean v1/v2/v3 signatures
                if any(item.filename.endswith(ext) for ext in [".SF", ".RSA", ".DSA", ".MF"]) or "MANIFEST" in item.filename:
                    continue
            
            # Preserve original compression method: resources.arsc and .so must stay ZIP_STORED
            buffer = zin.read(item.filename)
            if item.filename == "resources.arsc" or item.filename.endswith(".so"):
                item.compress_type = zipfile.ZIP_STORED
            zout.writestr(item, buffer)

        print("Step 2: Injecting freshly built frontend/dist assets...")
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir).replace("\\", "/")
                apk_path = f"assets/public/{rel_path}"
                zinfo = zipfile.ZipInfo(apk_path)
                zinfo.compress_type = zipfile.ZIP_DEFLATED
                with open(full_path, "rb") as f:
                    zout.writestr(zinfo, f.read())

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
        zinfo_cap = zipfile.ZipInfo("assets/capacitor.config.json")
        zinfo_cap.compress_type = zipfile.ZIP_DEFLATED
        zout.writestr(zinfo_cap, cap_config)

    print("Step 4: Signing & ZipAligning with uber-apk-signer (Scheme v1, v2, v3)...")
    if os.path.exists(output_apk):
        os.remove(output_apk)
    shutil.copyfile(temp_apk, output_apk)
    os.remove(temp_apk)

    sign_cmd = [
        java_exe,
        "-jar", signer_jar,
        "-a", output_apk,
        "--allowResign",
        "--overwrite"
    ]
    res = subprocess.run(sign_cmd, capture_output=True, text=True)
    print("Signer stdout:\n", res.stdout.strip())
    if res.returncode != 0:
        print("Signer stderr:\n", res.stderr.strip())
        print("Signing failed!")
        return

    print("Step 5: Updating user target file: SafeCircle-debug (2).apk...")
    shutil.copyfile(output_apk, input_apk)
    print(f"SUCCESS! Both '{output_apk}' and '{input_apk}' are valid, zipaligned, and signed with v2/v3 schemes!")

if __name__ == "__main__":
    patch_apk()
