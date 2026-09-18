import zipfile
import re

with zipfile.ZipFile("SafeCircle-debug (2).apk", "r") as z:
    for name in z.namelist():
        if name.endswith(".js") and "assets/public/assets" in name:
            data = z.read(name).decode("utf-8", errors="ignore")
            apis = set(re.findall(r"http[s]?://[a-zA-Z0-9\.\:\-]+", data))
            print(f"File {name} APIs:", apis)
            
            # Check for apiConfig or base url pattern
            for kw in ["API_BASE", "localhost", "192.168", "10.", "5000", "safecircle_api"]:
                matches = [m.start() for m in re.finditer(kw, data)]
                if matches:
                    print(f"  Keyword '{kw}' found at indices {matches[:3]}")
                    for idx in matches[:3]:
                        print("   Snippet:", data[max(0, idx-50):min(len(data), idx+100)])
