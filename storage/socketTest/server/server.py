from BaseHTTPServer import BaseHTTPRequestHandler
import cgi
import os

class   PostHandler(BaseHTTPRequestHandler):
    def load_binary(file):
        with open(file, 'rb') as file:
            return file.read()

    def do_GET(self):
        path=self.path.split('/')

        print path
        if(path[1]=='upload'):
            pId=path[2]
            volumeId=path[3]

            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD':'POST',
                         'CONTENT_TYPE':self.headers['Content-Type'],
                         }
            )
            self.send_response(200)
            self.end_headers()
            self.wfile.write('%s ' % str(pId) ) ##pid
            self.wfile.write('%s ' % str(volumeId)) ##volumdId
            self.wfile.write('%s '%os.path.getsize(volumeId))#offset
            for field in form.keys():
                field_item = form[field]
                filevalue  = field_item.value
                filesize = len(filevalue)
                self.wfile.write('%s'%str(filesize))
                print len(filevalue)
                with open(volumeId,'a') as f:
                    f.write(filevalue)
            return

    #https://github.com/tanzilli/playground/blob/master/python/httpserver/example2.py
        elif(path[1]=='download'):
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
    sever = HTTPServer(('localhost',8080),PostHandler)
    print 'Starting server, use <Ctrl-C> to stop'
    sever.serve_forever() 