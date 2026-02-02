import Swal from 'sweetalert2';

// Custom SweetAlert configurations with our theme
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const showSuccess = (message, title = 'Success!') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonColor: '#7C3AED',
    confirmButtonText: 'OK'
  });
};

export const showError = (message, title = 'Error!') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#7C3AED',
    confirmButtonText: 'OK'
  });
};

export const showWarning = (message, title = 'Warning!') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonColor: '#7C3AED',
    confirmButtonText: 'OK'
  });
};

export const showInfo = (message, title = 'Info') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonColor: '#7C3AED',
    confirmButtonText: 'OK'
  });
};

export const showConfirm = (message, title = 'Are you sure?') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#7C3AED',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  });
};

export const showToast = (message, icon = 'success') => {
  return Toast.fire({
    icon: icon,
    title: message
  });
};

export const showLoading = (title = 'Please wait...') => {
  return Swal.fire({
    title: title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export default Swal;
