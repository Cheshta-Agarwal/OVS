export default function AuthForm({ authMode, form, onFormChange, onSubmit, toggleMode, disabled }) {
  return (
    <section className="auth-panel">
      <div className="panel-heading">
        <h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <button className="button button-link" onClick={toggleMode} type="button" disabled={disabled}>
          {authMode === 'login' ? 'Need an account?' : 'Already have an account?'}
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          Username
          <input
            name="username"
            value={form.username}
            onChange={onFormChange}
            placeholder="username"
            autoComplete="username"
            disabled={disabled}
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onFormChange}
            placeholder="password"
            autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
            disabled={disabled}
          />
        </label>

        <button className="button button-primary" type="submit" disabled={disabled}>
          {authMode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </section>
  )
}
