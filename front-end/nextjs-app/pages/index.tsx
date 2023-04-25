import React, { useState } from "react";
import { FuseConnect } from "react-fuse-connect";

export default function Index() {
  const [clientSecret, setClientSecret] = useState("");

  const backendFetch = async (path: string, method: "POST", body: any) => {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    options.body = JSON.stringify(body);

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;

    const response = await fetch(url, options);

    const responseBody = await response.json();
    console.log("Backend Fetch Response", url, responseBody);
    return responseBody;
  };

  const linkAccountTapped = async () => {
    const response = await backendFetch("/create-session", "POST", {
      user_id: process.env.NEXT_PUBLIC_USER_ID,
      is_web_view: false,
    });

    setClientSecret(response["client_secret"]);
  };

  const onInstitutionSelected = async (
    institutionId: string,
    callback: (linkToken: string) => void
  ) => {
    const response = await backendFetch("/create-link-token", "POST", {
      user_id: process.env.NEXT_PUBLIC_USER_ID,
      institution_id: institutionId,
      client_secret: clientSecret,
    });

    callback(response["link_token"]);
  };

  const onSuccess = async (publicToken: string) => {
    await backendFetch("/exchange-public-token", "POST", {
      public_token: "publicToken",
    });
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <div>
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={linkAccountTapped}
          >
            Link Your Account
          </button>
        </div>
      </div>

      <FuseConnect
        clientSecret={clientSecret}
        onEvent={() => {}}
        onSuccess={onSuccess}
        onInstitutionSelected={onInstitutionSelected}
        onExit={() => {
          setClientSecret("");
        }}
      ></FuseConnect>
    </>
  );
}
