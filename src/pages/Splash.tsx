import logo from '@/assets/logoUpdate.svg';

const Splash = () => {
  return (
    <div className="relative w-full h-[100vh] flex flex-col gap-[22px] bg-linear-to-b  from-[#01C063] from-5% to-80%  to-primary items-center justify-center ">
      <div className="w-60px border-[1.5px] border-[#01C063] rounded-[128px]  h-[92px] bg-white flex p-[15px] items-center gap-3.5 justify-between">
        <div className="w-[61px] h-[61px] rounded-full overflow-hidden flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full h-full object-cover " />
        </div>
        <h2 className="text-primary text-[30px] font-family-segoe">
          Hippiekit
        </h2>
      </div>

      <p className="text-white font-family-segoe max-w-[253px] text-center font-bold leading-[30px] text-[20px] ">
        WHO ARE WE NOT TO CHANGE THE WORLD
      </p>
    </div>
  );
};

export default Splash;
