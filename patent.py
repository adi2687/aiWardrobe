import subprocess

def get_saved_wifi_passwords():
    # Get all saved Wi-Fi profiles
    profiles_data = subprocess.check_output(['netsh', 'wlan', 'show', 'profiles'], text=True)
    profiles = [line.split(":")[1].strip() for line in profiles_data.split('\n') if "All User Profile" in line]

    wifi_passwords = []

    for profile in profiles:
        try:
            # Get the password info for each profile
            result = subprocess.check_output(['netsh', 'wlan', 'show', 'profile', profile, 'key=clear'], text=True)
            for line in result.split('\n'):
                if "Key Content" in line:
                    password = line.split(":")[1].strip()
                    wifi_passwords.append((profile, password))
                    break
            else:
                wifi_passwords.append((profile, "No password found"))
        except subprocess.CalledProcessError:
            wifi_passwords.append((profile, "Error retrieving password"))

    return wifi_passwords

# Print saved Wi-Fi profiles and their passwords
for ssid, password in get_saved_wifi_passwords():
    print(f"SSID: {ssid} | Password: {password}")