import type { LoaderFunctionArgs } from "react-router-dom";
import {
  Form,
  Link,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  redirect,
  useFetcher,
  useLocation,
  useRouteLoaderData,
} from "react-router-dom";
import { auth0AuthProvider } from "./auth";

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    async loader() {
      let user = await auth0AuthProvider.username();
      // Our root route always provides the user, if logged in
      return { user };
    },
    Component: Layout,
    children: [
      {
        index: true,
        Component: PublicPage,
      },
      {
        path: "login",
        action: loginAction,
        loader: loginLoader,
        Component: LoginPage,
      },
      {
        path: "protected",
        loader: protectedLoader,
        Component: ProtectedPage,
      },
    ],
  },
  {
    path: "/login-result",
    async loader() {
      await auth0AuthProvider.handleSigninRedirect();
      let isAuthenticated = await auth0AuthProvider.isAuthenticated();
      if (isAuthenticated) {
        let redirectTo =
          new URLSearchParams(window.location.search).get("redirectTo") || "/";
        return redirect(redirectTo);
      }
      return redirect("/");
    },
    Component: () => null,
  },
  {
    path: "/logout",
    async action() {
      // We signout in a "resource route" that we can hit from a fetcher.Form
      await auth0AuthProvider.signout();
      return redirect("/");
    },
  },
]);

export default function App() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
  );
}

function Layout() {
  return (
    <div>
      <h1>Auth Example using RouterProvider</h1>

      <p>
        This example demonstrates a simple login flow with three pages: a public
        page, a protected page, and a login page. In order to see the protected
        page, you must first login. Pretty standard stuff.
      </p>

      <p>
        First, visit the public page. Then, visit the protected page. You're not
        yet logged in, so you are redirected to the login page. After you login,
        you are redirected back to the protected page.
      </p>

      <p>
        Notice the URL change each time. If you click the back button at this
        point, would you expect to go back to the login page? No! You're already
        logged in. Try it out, and you'll see you go back to the page you
        visited just *before* logging in, the public page.
      </p>

      <AuthStatus />

      <ul>
        <li>
          <Link to="/">Public Page</Link>
        </li>
        <li>
          <Link to="/protected">Protected Page</Link>
        </li>
      </ul>

      <Outlet />
    </div>
  );
}

function AuthStatus() {
  // Get our logged in user, if they exist, from the root route loader data
  let { user } = useRouteLoaderData("root") as { user: string | null };
  let fetcher = useFetcher();

  if (!user) {
    return <p>You are not logged in.</p>;
  }

  let isLoggingOut = fetcher.formData != null;

  return (
    <div>
      <p>Welcome {user}!</p>
      <fetcher.Form method="post" action="/logout">
        <button type="submit" disabled={isLoggingOut}>
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </button>
      </fetcher.Form>
    </div>
  );
}

async function loginAction({ request }: LoaderFunctionArgs) {
  let formData = await request.formData();
  let redirectTo = (formData.get("redirectTo") as string | null) || "/";
  let type = formData.get("type") as string | null;
  await auth0AuthProvider.signin(
    type === "redirect" ? "redirect" : "popup",
    redirectTo
  );
  if (type === "popup") {
    return redirect(redirectTo);
  }
  return null;
}

async function loginLoader() {
  let isAuthenticated = await auth0AuthProvider.isAuthenticated();
  if (isAuthenticated) {
    return redirect("/");
  }
  return null;
}

function LoginPage() {
  let location = useLocation();
  let params = new URLSearchParams(location.search);
  let from = params.get("from") || "/";

  return (
    <div>
      <p>You must log in to view the page at {from}</p>

      <Form method="post" replace>
        <input type="hidden" name="redirectTo" value={from} />
        <button type="submit" name="type" value="popup">
          Login with Popup
        </button>
        <button type="submit" name="type" value="redirect">
          Login with Redirect
        </button>
      </Form>
    </div>
  );
}

function PublicPage() {
  return <h3>Public</h3>;
}

async function protectedLoader({ request }: LoaderFunctionArgs) {
  // If the user is not logged in and tries to access `/protected`, we redirect
  // them to `/login` with a `from` parameter that allows login to redirect back
  // to this page upon successful authentication
  let isAuthenticated = await auth0AuthProvider.isAuthenticated();
  if (!isAuthenticated) {
    let params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    return redirect("/login?" + params.toString());
  }
  return null;
}

function ProtectedPage() {
  return <h3>Protected</h3>;
}
