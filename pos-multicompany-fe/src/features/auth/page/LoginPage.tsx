import loginBg from '@/assets/images/bg-login.png'
import LoginForm from '../components/LoginForm';


export default function LoginPage() {

  return (
    <main
      className="login-page flex h-screen items-center  justify-center lg:justify-end"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm block lg:hidden"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-black/45 block lg:hidden" />
      <LoginForm />
      
    </main>
  );
}
