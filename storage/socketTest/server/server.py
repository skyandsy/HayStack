from BaseHTTPServer import BaseHTTPRequestHandler
import cgi
class   PostHandler(BaseHTTPRequestHandler):
    def load_binary(file):
        with open(file, 'rb') as file:
            return file.read()

    def do_GET(self):
        path=self.path.split('/')
        print path
        if(path[1]=='upload'):
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD':'POST',
                         'CONTENT_TYPE':self.headers['Content-Type'],
                         }
            )
            self.send_response(200)
            self.end_headers()
            self.wfile.write('Client: %sn ' % str(self.client_address) )
            self.wfile.write('User-agent: %sn' % str(self.headers['user-agent']))
            self.wfile.write('Path: %sn'%self.path)
            self.wfile.write('Form data:n')
            for field in form.keys():
                field_item = form[field]
                filename = field_item.filename
                filevalue  = field_item.value
                filesize = len(filevalue)
                print len(filevalue)
                with open(filename,'wb') as f:
                    f.write(filevalue)
            return


    #https://github.com/tanzilli/playground/blob/master/python/httpserver/example2.py
        elif(path[1]=='download'):
            print "here"
            f = open(path[2]) 
            self.send_response(200)
            self.send_header('Content-type','image/jpg')
            self.end_headers()
            self.wfile.write(f.read())
            f.close()
            return 
            

    
if __name__=='__main__':
    from BaseHTTPServer import HTTPServer
    sever = HTTPServer(('localhost',8080),PostHandler)
    print 'Starting server, use <Ctrl-C> to stop'
    sever.serve_forever() 