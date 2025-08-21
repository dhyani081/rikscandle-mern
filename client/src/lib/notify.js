// client/src/lib/notify.js
import { toast } from 'react-toastify';

const base = {
  position: 'top-right',
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

const normalizeErr = (e) =>
  e?.response?.data?.message || e?.message || 'Something went wrong';

const promise = (p, { pending = 'Please wait…', success = 'Done', error = 'Failed' } = {}) => {
  // Show toast tied to the same promise
  toast.promise(
    p,
    {
      pending,
      success,
      error: {
        render({ data }) {
          // data is the rejection (error object)
          return normalizeErr(data);
        },
      },
    },
    base
  );
  // Return the original promise so callers can await the real response
  return p;
};

const notify = {
  success: (m, o = {}) => toast.success(m, { ...base, ...o }),
  error: (m, o = {}) => toast.error(m, { ...base, ...o }),
  info: (m, o = {}) => toast.info(m, { ...base, ...o }),
  warning: (m, o = {}) => toast.warning(m, { ...base, ...o }),
  promise,
  fromError: (e) => toast.error(normalizeErr(e), base),
};

export default notify;
export { notify };
