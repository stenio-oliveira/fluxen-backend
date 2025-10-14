import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { UsuarioRepository } from '../repositories/usuarioRepository';

const secret = process.env.JWT_SECRET || 'default_secret';

export class AuthController {
  async register(req: Request, res: Response) {
    const { username, senha, nome, email } = req.body;
    console.log('body: ', req.body)
    if (!username || !senha || !nome || !email) {
      return res.status(400).json({ message: 'Todos os campos (username, senha, nome, email) são obrigatórios.' });
    }

    // Simple email validation (regex for more sophistication if needed)
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Email inválido.' });
    }

    if (typeof senha !== 'string' || senha.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    // Optionally, check username/email duplication
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Usuário ou email já cadastrado.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(senha, 10);
      const user = await prisma.usuario.create({
        data: { username, senha: hashedPassword, nome, email },
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    console.log('body: ', req.body)
    const userRepository = new UsuarioRepository();
    try {
      const user = await userRepository.findByEmail(email);

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
       console.log('password: ', password)
     
      const correctPass = await bcrypt.compare(password, user.senha);
      console.log('correctPass', correctPass);
      if (correctPass) {
        const token = jwt.sign({ id: user.id, email: user.email }, secret, {
          expiresIn: "2h",
        });
        return res.json({ token });
      }
      return res.status(401).json({message: 'Senha ou email incorreto'});
     
    } catch (error : any) {
      console.log('error: ', error)
      res.status(500).json({ message: 'Error logging in', error : error.message });
    }
  }
}
