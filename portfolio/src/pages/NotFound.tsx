import { TLink } from '../components/TransitionLink';

export function NotFound() {
  return (
    <main id="main" className="container notfound">
      <h1 className="display-l on-sky">This page drifted off.</h1>
      <TLink className="btn btn--ink" to="/">Back home</TLink>
    </main>
  );
}
