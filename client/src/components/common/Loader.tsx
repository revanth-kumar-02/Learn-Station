export default function Loader({ size = 'md', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="loader-fullpage">
        <div className={`loader loader--${size}`}>
          <div className="loader__ring" />
        </div>
      </div>
    );
  }

  return (
    <div className={`loader loader--${size}`}>
      <div className="loader__ring" />
    </div>
  );
}
