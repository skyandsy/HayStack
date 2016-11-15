#coding=utf-8
import requests
## http://www.yanyaozhen.com/archives/54/
def downloadImage(imgName ="default.jpg"):
    url = 'http://localhost:8080/download/'  
    r = requests.get(url+imgName,stream= True)
    image = r.content
    destDir="./"
    print("Save Image"+destDir+imgName+"\n")
    try:
        with open(destDir+imgName ,"wb") as jpg:
            jpg.write(image)     
        print("save success")
        return
    except IOError:
        print("IO Error")
        return
    finally:
        jpg.close

def uploadImage(key='image2.jpg'):
	url = 'http://localhost:8080/'  
	path = 'image2.jpg'  
	files = {'file': open(path, 'rb')}  
	r = requests.post(url, files=files)  
	print r.url,r.text  

	
	
