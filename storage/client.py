#coding=utf-8
import requests
## http://www.yanyaozhen.com/archives/54/
def downloadImage(volumeId,offSet,fileLen):
    #c.downloadImage('volume1',156442,156442)
    url = 'http://localhost:8080/download/'+volumeId+"/"+str(offSet)+"/"+str(fileLen) 
    r = requests.get(url,stream= True)
    image = r.content

    ##imgName='seemeseeme.jpg'
    ##destDir="./"
    ##print("Save Image"+destDir+imgName+"\n")
    ##try:
    ##    with open(destDir+imgName ,"wb") as jpg:
    ##        jpg.write(image)     
    ##    print("save success")
    ##    return
    ##except IOError:
    ##    print("IO Error")
    ##    return
    ##finally:
    ##    jpg.close

def uploadImage(filePath,pid,volumeId):
    #c.uploadImage('c1.bmp','pid','volume1')
    FSUrl = 'http://localhost:8080/upload/pid/'+volumeId  
    files = {'file': open(filePath, 'rb')}  
    r = requests.get(FSUrl, files=files)
    texts=r.text.split(' ')







	
	
