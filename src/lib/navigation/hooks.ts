/**
 * Abstracted routing hooks — wraps react-router-dom hooks.
 * When migrating to Next.js, replace with next/navigation hooks.
 */
import {
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
  useLocation as useRouterLocation,
  useNavigate as useRouterNavigate,
} from "react-router-dom";

export const useParams = useRouterParams;
export const useSearchParams = useRouterSearchParams;
export const usePathname = () => {
  const location = useRouterLocation();
  return location.pathname;
};
export const useRouter = () => {
  const navigate = useRouterNavigate();
  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
  };
};
