function UserInfoFallback() {
  return (
    <div className="container max-w-sm rounded-md bg-slate-100 flex flex-col gap-4 p-6 h-fit animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
        <div className="h-4 w-full bg-gray-200 rounded"></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default UserInfoFallback;
