"use client";

import {
  useRouter,
} from "next/navigation";
import {
  useState,
} from "react";

type StaffOption = {
  id: string;
  staffNumber: string;
  name: string;
  role: string;
  branch: {
    id: string;
    name: string;
  } | null;
};

type AccountItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangeCredential: boolean;
  credentialVersion: number;
  createdAt: string;
  credentialChangedAt: string | null;
  staff: {
    id: string;
    staffNumber: string;
    name: string;
    role: string;
    isActive: boolean;
    branch: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type Props = {
  accounts: AccountItem[];
  eligibleStaff: StaffOption[];
  currentAdminId: string;
};

export default function AccountManagementClient({
  accounts,
  eligibleStaff,
  currentAdminId,
}: Props) {
  const router =
    useRouter();

  const [
    staffId,
    setStaffId,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    temporaryPin,
    setTemporaryPin,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    resetAccountId,
    setResetAccountId,
  ] =
    useState<string | null>(
      null
    );

  const [
    resetPin,
    setResetPin,
  ] =
    useState("");

  function clearFeedback() {
    setMessage(null);
    setError(null);
  }

  async function createAccount(
    event: React.FormEvent
  ) {
    event.preventDefault();

    clearFeedback();
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/accounts",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              staffId,
              email,
              temporaryPin,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to create account."
        );

        return;
      }

      setStaffId("");
      setEmail("");
      setTemporaryPin("");

      setMessage(
        data.message ||
          "Account created."
      );

      router.refresh();
    } catch {
      setError(
        "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateAccount(
    accountId: string,
    action:
      | "enable"
      | "disable"
      | "resetCredential",
    pin?: string
  ) {
    clearFeedback();
    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/admin/accounts/${accountId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action,
              ...(action ===
              "resetCredential"
                ? {
                    temporaryPin:
                      pin,
                  }
                : {}),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to update account."
        );

        return;
      }

      setMessage(
        data.message ||
          "Account updated."
      );

      if (
        action ===
        "resetCredential"
      ) {
        setResetAccountId(
          null
        );
        setResetPin("");
      }

      router.refresh();
    } catch {
      setError(
        "Unable to update account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Create Staff Login
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create an administration login for an active
          staff member who does not already have one.
        </p>

        <form
          onSubmit={
            createAccount
          }
          className="mt-6 grid gap-5 lg:grid-cols-3"
        >
          <div>
            <label
              htmlFor="staffId"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Staff Member
            </label>

            <select
              id="staffId"
              value={
                staffId
              }
              onChange={(
                event
              ) =>
                setStaffId(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              required
            >
              <option value="">
                Select staff member
              </option>

              {eligibleStaff.map(
                (
                  staff
                ) => (
                  <option
                    key={
                      staff.id
                    }
                    value={
                      staff.id
                    }
                  >
                    {staff.name}
                    {" - "}
                    {staff.staffNumber}
                    {" - "}
                    {staff.role}
                    {staff.branch
                      ? ` - ${staff.branch.name}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Login Email
            </label>

            <input
              id="email"
              type="email"
              value={
                email
              }
              onChange={(
                event
              ) =>
                setEmail(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              required
            />
          </div>

          <div>
            <label
              htmlFor="temporaryPin"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Temporary PIN / Password
            </label>

            <input
              id="temporaryPin"
              type="password"
              value={
                temporaryPin
              }
              onChange={(
                event
              ) =>
                setTemporaryPin(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              required
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Minimum 10 characters with at least one
              letter and one number.
            </p>
          </div>

          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={
                loading ||
                eligibleStaff.length ===
                  0
              }
              className="rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Working..."
                : "Create Account"}
            </button>
          </div>
        </form>

        {eligibleStaff.length ===
          0 && (
          <p className="mt-4 text-sm text-slate-500">
            Every active staff member already has an
            administration account, or there are no
            eligible staff records.
          </p>
        )}
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-950">
            Administration Accounts
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Enable, disable or reset staff login
            credentials.
          </p>
        </div>

        <div className="space-y-4">
          {accounts.map(
            (
              account
            ) => {
              const isCurrent =
                account.id ===
                currentAdminId;

              return (
                <article
                  key={
                    account.id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">
                          {account.name}
                        </h3>

                        <span
                          className={
                            account.isActive
                              ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800"
                              : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800"
                          }
                        >
                          {account.isActive
                            ? "Active"
                            : "Disabled"}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {account.role}
                        </span>

                        {account.mustChangeCredential && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                            Must Change PIN
                          </span>
                        )}

                        {isCurrent && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                            Your Account
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-slate-700">
                        {account.email}
                      </p>

                      {account.staff && (
                        <p className="mt-1 text-xs text-slate-500">
                          {account.staff.staffNumber}
                          {" · "}
                          {account.staff.role}
                          {account.staff.branch
                            ? ` · ${account.staff.branch.name}`
                            : ""}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-slate-500">
                        Credential version:{" "}
                        {account.credentialVersion}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {account.isActive ? (
                        <button
                          type="button"
                          disabled={
                            loading ||
                            isCurrent
                          }
                          onClick={
                            () =>
                              updateAccount(
                                account.id,
                                "disable"
                              )
                          }
                          className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={
                            loading
                          }
                          onClick={
                            () =>
                              updateAccount(
                                account.id,
                                "enable"
                              )
                          }
                          className="rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Enable
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={
                          loading
                        }
                        onClick={
                          () => {
                            clearFeedback();

                            setResetAccountId(
                              account.id
                            );

                            setResetPin("");
                          }
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reset Credential
                      </button>
                    </div>
                  </div>

                  {resetAccountId ===
                    account.id && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <label
                        htmlFor={`reset-${account.id}`}
                        className="block text-sm font-semibold text-slate-800"
                      >
                        Temporary PIN / Password
                      </label>

                      <input
                        id={`reset-${account.id}`}
                        type="password"
                        value={
                          resetPin
                        }
                        onChange={(
                          event
                        ) =>
                          setResetPin(
                            event.target.value
                          )
                        }
                        className="mt-2 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2.5"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Minimum 10 characters with at
                        least one letter and one number.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={
                            loading ||
                            !resetPin
                          }
                          onClick={
                            () =>
                              updateAccount(
                                account.id,
                                "resetCredential",
                                resetPin
                              )
                          }
                          className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Confirm Reset
                        </button>

                        <button
                          type="button"
                          disabled={
                            loading
                          }
                          onClick={
                            () => {
                              setResetAccountId(
                                null
                              );
                              setResetPin("");
                            }
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            }
          )}
        </div>
      </section>
    </div>
  );
}
