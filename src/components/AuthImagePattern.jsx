const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-[6rem] ">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`w-[8.5rem] h-[6.5rem] rounded-2xl bg-purple-300/10 ${
                i % 2 === 0 ? "animate-pulse " : ""
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold ">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
    

  );
};

export default AuthImagePattern;