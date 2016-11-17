from BaseHTTPServer import BaseHTTPRequestHandler
import cgi
import os
import requests
import base64
import sys

class   PostHandler(BaseHTTPRequestHandler):
    def load_binary(file):
        with open(file, 'rb') as file:
            return file.read()

    def do_POST(self):
        path=self.path.split('/')

        print path
        if(path[1]=='upload'):
            print "=========receive upload request========="

            pId=path[2]
            volumeId=path[3]

            content_len = int(self.headers.getheader('content-length', 0))
            post_body = self.rfile.read(content_len)
            self.send_response(200)
            self.end_headers()
            self.wfile.write('%s ' % str(pId) ) ##pid
            self.wfile.write('%s ' % str(volumeId)) ##volumdId

            print("=====1") 

            if(os.path.isfile(volumeId)):
                print("=====2")

                self.wfile.write('%s '%os.path.getsize(volumeId))#offset
                texts=[str(pId),str(volumeId),str(os.path.getsize(volumeId)),str(content_len)]
            else: #file not exists
                print("=====3")

                self.wfile.write('%s '%str(0))
                texts=[str(pId),str(volumeId),"0",str(content_len)]
            self.wfile.write('%s'%str(content_len))
            with open(volumeId,'a') as f:
                f.write(post_body)
            print("=====4")

            ##tell the redis
            cacheUrl= 'http://172.18.0.12:8080/'+texts[0]+'/'+texts[1]+'/'+texts[2]+'/'+texts[3]
            print( cacheUrl)
            r = requests.post(cacheUrl)
            print(r.text)
            return
    #https://github.com/tanzilli/playground/blob/master/python/httpserver/example2.py
        elif(path[1]=='download'):
            print "=========receive download request========="
            volumeId=path[2]
            offset=int(path[3])
            fileLen=int(path[4])

            f = open(volumeId)
            f.seek(offset,0)

            self.send_response(200)
            self.send_header('Content-type','image/jpeg')
            self.end_headers()
            self.wfile.write(f.read(fileLen))
            f.close()
            return 
            

    
if __name__=='__main__':
    from BaseHTTPServer import HTTPServer
    sever = HTTPServer(('0.0.0.0',8080),PostHandler)#172.18.0.13
    print 'Starting server, use <Ctrl-C> to stop'
    sever.serve_forever() 