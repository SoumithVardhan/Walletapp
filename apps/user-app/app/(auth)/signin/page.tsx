
"use client";
import { Logo } from "@repo/ui/Logo";
import { Button } from "@repo/ui/button";
import { AuthInput } from "@repo/ui/AuthInput";
import { useEffect, useState } from "react";

import { signIn } from "next-auth/react";
import { useMessage } from "../../../hooks/useMessage";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
export default function () {
  const [input, setInput] = useState({
    username: "",
    password: "",
  });
  const [demoUser, setDemoUser] = useState<any>(null);
  const [loading, setLoading] = useState<{ state: boolean; index?: number }>({
    state: false,
    index: 1,
  });

  const { bark } = useMessage();

  const router = useRouter();

  const handleDemoLogin = (user: number) => {
    setLoading({ state: true, index: user });
    setDemoUser(user);
    setInput({ username: `user${user}@wallet.com`, password: "111111" });
  };
  useEffect(() => {
    if (demoUser !== null) {
      login();
    }
  }, [input]);

  const handleRegularLogin = async () => {
    setLoading({ state: true, index: 0 });
    login();
  };

  const login = async () => {
    const response: any = await signIn("credentials", {
      username: input.username,
      password: input.password,
      redirect: false,
      callbackUrl: "/transfer",
    });

    if (response?.ok) {
      router.push("/transfer");
      router.refresh();
      setLoading({ state: false });
      bark({ message: "Successfully Logged In", success: true });
    } else {
      bark({
        message: "Unable to login. Please enter valid credentials",
        success: false,
      });

      setLoading({ state: false });
    }
  };

  return (
    <section className="   h-screen w-screen">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
        <div className="text-2xl " onClick={() => router.push("/")}>
          {" "}
          <Logo />
        </div>

        <Card title={"Signin"}>
          <div className="space-y-4 md:space-y-6">
            <div>
              <AuthInput
                keyStr={"username"}
                val={input.username}
                onChange={setInput}
                label={"Email/Phone Number"}
                placeholder={"Enter your email/phone number "}
              />
            </div>

            <div>
              <AuthInput
                val={input.password}
                keyStr={"password"}
                type={"password"}
                onChange={setInput}
                label={"Password"}
                placeholder={"**********"}
              />
            </div>
            {/* <div>
                  <AuthInput keyStr={"cpassword"}type={"password"} onChange={ setInput} label={"Confirm Password"} placeholder={"**********"}/>
                  </div> */}

            <div className="flex justify-center w-full">
              <Button
                full={true}
                loading={loading.state && loading.index == 0}
                onClick={handleRegularLogin}
              >
                Signin
              </Button>
            </div>

            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-primary-600 hover:underline dark:text-primary-500"
              >
                Signup here
              </a>
            </p>
            <div className="flex flex-col items-center">
              <Button
                full={true}
                loading={loading.state && loading.index == 1}
                onClick={() => handleDemoLogin(1)}
              >
                Login as demo user 1
              </Button>
              <Button
                full={true}
                loading={loading.state && loading.index == 2}
                onClick={() => handleDemoLogin(2)}
              >
                Login as demo user 2
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
