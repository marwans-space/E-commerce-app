import { useState, useEffect } from "react";
type User = {
  name: string;
  _id: string;
  profileImg: string;
  address: string;
  number: string;
  cart: [];
  wishlist: [];
};
async function fetchUser(): Promise<User> {
  const res = await fetch("http://localhost:3434/auth/me", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`HTTP Error! status ${res.status}`);
  }
  const data = await res.json();
  return data.items;
}
export function Profile() {
  const [user, setUser] = useState({});
  useEffect(() => {
    const loadUser = async () => {
      const data = await fetchUser();
      setUser(data);
      console.log(data);
    };
    loadUser();
  }, []);
  return (
    <main className="mx-auto min-h-[45vh] w-[calc(100%-36px)] max-w-310 py-10 text-black md:w-[calc(100%-48px)] md:py-16 lg:w-[min(1240px,calc(100%-64px))]">
      <h1 className="text-[32px] leading-tight font-extrabold tracking-[-1.5px] md:text-[40px]">
        YOUR PROFILE
      </h1>
      <div className="flex">
        <div>Image</div>
        <div>
          <p>
            <span>NAME:</span>
          </p>
        </div>
      </div>
    </main>
  );
}
