import json 
response = requests.get("http://api.open-notify.org/iss-now.json")
print(response.status_code)