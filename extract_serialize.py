
filename = 'node_modules/@wppconnect-team/wppconnect/dist/lib/wapi/wapi.js'
search_term = '_serializeRawObj'

try:
    with open(filename, 'r') as f:
        content = f.read()
        
    import re
    matches = [m.start() for m in re.finditer(re.escape(search_term), content)]
    
    if matches:
        for index in matches[:1]: # just check definition usually first assignment or so
             # Actually definition might be later. Let's print context for all of them but limit quantity
             start = max(0, index - 50)
             end = min(len(content), index + 800)
             print(f"--- Match at {index} ---")
             print(content[start:end])
    else:
        print("Term not found")

except FileNotFoundError:
    print("File not found")
