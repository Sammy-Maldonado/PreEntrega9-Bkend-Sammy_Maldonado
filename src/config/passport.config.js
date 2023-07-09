import passport from 'passport';
import local from 'passport-local';
import GithubStrategy from 'passport-github2';
import { usersService } from '../services/index.js';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { createHash, validatePassword } from '../services/auth.js';
import { cookieExtractor } from '../utils.js';

const LocalStrategy = local.Strategy;
const JWTStrategy = Strategy;

const initializePassportStrategies = () => {
  passport.use('register', new LocalStrategy({ passReqToCallback: true, usernameField: 'email' }, async (req, email, password, done) => {
    try {
      const { first_name, last_name, role, age } = req.body;
      const exists = await usersService.getUserBy({ email });
      if (exists)
        return done(null, false, { message: 'El usuario ya existe' })
      const hashedPassword = await createHash(password);
      const newUser = {
        name: `${first_name} ${last_name}`,
        email,
        age,
        role,
        password: hashedPassword
      }
      const result = await usersService.createUser(newUser);
      done(null, result)
    } catch (error) {
      done(error)
    }
  }));

  //Todas las demas estrategias van acá, por ejemplo, la estrategia de login
  passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    let resultUser;
    try {
      if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
        //Acá entro como SUPER ADMIN
        const resultUser = {
          id: 0,
          name: "Admin",
          email: "adminCoder@coder.com",
          role: "superadmin",
        }
        return done(null, resultUser)
      }

      //Buscando al usuario
      const user = await usersService.getUserBy({ email });
      if (!user) return done(null, false, { message: "Usuario no encontrado" });

      //Verificando su password encriptado
      const isValidPassword = await validatePassword(password, user.password);
      if (!isValidPassword) return done(null, false, { message: "Contraseña incorrecta" })

      //Creando al usuario (req.user)
      resultUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
      return done(null, resultUser);
    } catch (error) {
      return done(error)
    }
  }));

  /* Github */
  passport.use(
    'github',
    new GithubStrategy(
      {
        clientID: "Iv1.91be627b8795a242",
        clientSecret: "7668c55a865f8a4a71f973d6d961d2a952f2f951",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          /* console.log(profile); */
          const { name, email } = profile._json;
          const user = await usersService.getUserBy({ email });
          //Creando el usuario si no existe.
          if (!user) {
            const newUser = {
              name: name,
              email,
              password: ''
            }
            const result = await usersService.createUser(newUser);
            done(null, result);
          }
          //En caso de que si exista.
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  //Passport se encargará de la verificación de mi token
  /* Estrategia de JWT para extraer el token de la Cookie. Extractor en -> utils.js*/
  passport.use('jwt', new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: 'jwtSecret'
  }, async (payload, done) => {
    try {
      return done(null, payload);
    } catch (error) {
      return done(error);
    }
  }))
};

export default initializePassportStrategies;