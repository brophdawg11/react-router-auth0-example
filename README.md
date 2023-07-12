# React Router Auth0 Example

This example demonstrates how to restrict access to routes to authenticated users when using `<RouterProvider>` while using https://auth0.com/ and the Vanilla JS [`@auth0/auth0-spa-js`](https://github.com/auth0/auth0-spa-js) SDK.

This is an extension of the basic [RouterProvider Authorization example](https://github.com/remix-run/react-router/tree/main/examples/auth-router-provider) in the repository.

## Prerequisites

You will need an Auth0 application set up before you can run this example.

Once you have created the application, you will want to change some of the default settings:

- Go to your application in the Auth0 dashboard
- Choose the Settings tab
  - Add `http://localhost:3000/, http://localhost:3000/login-result` to `Allowed Callback URLs`
  - Add `http://localhost:3000` to `Allowed Logout URLs`
  - Add `http://localhost:3000` to `Allowed Web Origins`
- Choose the `Credentials` tab
  - Set `Authentication Methods` to `None`
  - See https://community.auth0.com/t/success-login-and-a-failed-exchange/41513/8 for background

## Usage

- Clone this repo
- `npm ci`
- Change the two constants in `src/auth.ts` to include your Auth0 application values:
  - `const AUTH0_DOMAIN`
  - `const AUTH0_CLIENT_ID`
- `npm run dev`
- Open `http://localhost:3000`
