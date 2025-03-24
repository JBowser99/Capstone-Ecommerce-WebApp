const LoadingScreen = () => {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white z-50 fixed top-0 left-0">
        <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  };
  
  export default LoadingScreen;
  