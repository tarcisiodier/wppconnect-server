
filename = 'node_modules/@wppconnect-team/wppconnect/dist/lib/wapi/wapi.js'
search_term = 'window.WAPI.getAllContacts'

try:
    with open(filename, 'r') as f:
        content = f.read()
        
    index = content.find(search_term)
    if index == -1:
        # Try without window
        search_term = 'WAPI.getAllContacts'
        index = content.find(search_term)

    if index != -1:
        start = max(0, index - 100)
        end = min(len(content), index + 500)
        print(content[start:end])
    else:
        print("Term not found")

except FileNotFoundError:
    print("File not found")
