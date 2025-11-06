import logo from '@/assets/logoCropped.png';

const Splash = () => {
  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-secondary">
      <div className="w-[161.72px] h-[163.78px] rounded-full border-[5px] border-white overflow-hidden flex items-center justify-center">
        <img src={logo} alt="Logo" className="w-full h-full object-cover " />
      </div>
    </div>
  );
};

export default Splash;
