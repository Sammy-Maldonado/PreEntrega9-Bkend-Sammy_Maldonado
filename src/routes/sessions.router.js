import BaseRouter from "./router.js";
import { generateToken, passportCall } from "../services/auth.js";


export default class SessionsRouter extends BaseRouter {
  
  init() {

    this.get('/', ['PUBLIC'], passportCall('jwt', {strategyType: 'jwt', session:false }), (req,res) => {
      const currentUser = req.user;
      res.sendSuccessWithPayload(currentUser)
    })

    this.get('/current', ['PUBLIC'], passportCall('jwt', {strategyType: 'jwt', session:false }), (req,res) => {
      const currentUser = req.user;
      res.sendSuccessWithPayload(currentUser)
    })

    this.post('/register', ['PUBLIC'], passportCall('register', { strategyType: "locals", session:false }), (req, res) => {
      res.sendSuccess()
    })

    this.post('/login', ['PUBLIC'], passportCall('login', { strategyType: "locals", session:false }), (req, res) => {
      const token = generateToken(req.user);

      //Aqui envío el token generado para el usuario, al frontend, por una cookie.
      //El siguiente paso es extraer el token de la cookie con la estrategia 'jwt' -> passport.config.js :72
      res.cookie('authToken', token, {
        maxAge: 1000 * 3600 * 24,   //1seg*1hr*24hrs = 24hrs
        httpOnly: true
      }).sendSuccess("Logged In")   //Logeado con exito
    })

    this.get('/github',['PUBLIC'], passportCall('github', {strategyType: 'github', session:false }), (req, res) => { });
    
    this.get('/githubcallback',['PUBLIC'], passportCall('github', {strategyType: 'github', session:false }), (req, res) => {
      const user = {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        email: req.user.email
      };
      //console.log(user);
      const accessToken = generateToken(user);

      res.cookie('authToken', accessToken, {
        maxAge: 1000*3600*24,
        httpOnly:true
      }).sendSuccess("Github login success")
    })

    this.post('/logout',['PUBLIC'], async (req, res) => {
      // Borra la cookie en la respuesta
      res.clearCookie('authToken');
      // Envía una respuesta JSON que indica el logout exitoso
      res.sendSuccess("Logged Out");
    });
  };
}


