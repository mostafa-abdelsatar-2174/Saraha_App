import DBConnection from "./DB/DB.connection.js"
import authController from "./modules/auth/auth.controller.js"
import userController from "./modules/user/user.controller.js"
export default async function bootstrap(app, express) {
  app.use(express.json())
  DBConnection()
  app.use("/auth", authController)
  app.use("/user", userController)
}