import jwt from 'jsonwebtoken';

export const authToken = (req, res, next) => {
  //En esta practica vamos a tomarlo desde los headers.

  const authHeader = req.header.authorization;
  if(!authHeader) res.status(401).send({status:"error", error:"No autenticado"})
  const token = authHeader.split(" ")[1];

  //Existe el token pero, es valido?. Lo validamos:
  jwt.verify(token, 'jwtSecret', (error,credentials) => {
    if(error) return res.status(401).send({error:"Token inválido"});
    req.user = credentials.user;
    next();
  })

}