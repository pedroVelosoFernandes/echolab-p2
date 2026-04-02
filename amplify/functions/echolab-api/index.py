from mangum import Mangum

from echolab.app import app

handler = Mangum(app)
