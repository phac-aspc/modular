import json
import os

def createDict(path):
    print(path)
    directorObjects = []
    for x in os.scandir(path):
        if(x.path.find(".") == -1):
            if (x.path.find("en/covid-19")):
                lang = "en"
            else:
                lang = "fr"
            info = x.path.split("/")
            ob = {"prod" : info[1], "lang" : lang , "date" : info[3], "path" : (x.path + "/")}
            directorObjects.append(ob)
    return directorObjects

def main():
    directoryEN = r'covid-19'
    directoryFR = r'covid-19'
    dirs = [directoryEN,directoryFR]
    
    for directory in dirs: 
        for root, dirs, files in os.walk(directory):
            for d in dirs:
                if(d == "archive" != -1):
                    with open('data.json', 'w', encoding='utf-8') as f:
                        for jsonObject in createDict(os.path.relpath(os.path.join(root, d), ".")):
                            json.dump(jsonObject, f, ensure_ascii=False, indent=4)
            
if __name__ == "__main__":
    main()