'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { CircularProgress } from '@mui/material';
import { authClient } from '@/lib/auth/client';
import { useUsers } from '@/hooks/use-user';

// Define form values type
type Values = {
  no_identitas: string;
  password: string;
};

// Memoize the input styles to avoid re-creating on every render
const inputStyles = {
  backgroundColor: 'white',
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#DFF2EB',
  },
};

// Memoize the label styles
const labelStyles = {
  color: 'black',
  '&.Mui-focused': { color: 'black' },
};

// Memoize the button styles
const buttonStyles = {
  bgcolor: '#79D7BE',
  color: '#000',
  '&:hover': { bgcolor: '#B9E5E8' },
  position: 'relative',
};

// Memoized Form Component to prevent unnecessary re-renders
const SignInForm = React.memo((): React.JSX.Element => {
  const { checkSession } = useUsers();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    mode: 'onSubmit', // Validate only on submit to reduce re-renders
    defaultValues: {
      no_identitas: '',
      password: '',
    },
  });

  // Memoize the toggle password handler
  const togglePasswordVisibility = React.useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Memoize the onSubmit handler with stable dependencies
  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      try {
        const { error, user } = await authClient.signInWithPassword(values);

        if (error) {
          setError('root', { type: 'server', message: 'Login gagal. Silakan coba lagi.' });
          return;
        }

        if (user) {
          // Use setTimeout only if necessary; otherwise, perform actions immediately
          await checkSession?.();
          router.refresh();
        } else {
          setError('root', { type: 'server', message: 'Login gagal. Silakan coba lagi.' });
        }
      } catch (err) {
        console.error('Kesalahan login:', err);
        setError('root', { type: 'server', message: 'Terjadi kesalahan tak terduga. Silakan coba lagi.' });
      } finally {
        setIsPending(false);
      }
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={3} sx={{ maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Link href="/">
          <Box
            component="img"
            alt="Logo USK"
            src="/assets/logousk.png"
            sx={{ height: 120, width: 120 }} // Reduced size for faster rendering
          />
        </Link>
      </Box>
      <Stack spacing={1} sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#fff' }}>
          Welcome
        </Typography>
        <Typography variant="h6" sx={{ color: '#fff' }}>
          Sistem Pengaduan & Layanan USK
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="no_identitas"
            rules={{
              required: 'NPM/NIP wajib diisi',
              validate: (value) => value.trim() !== '' || 'NPM/NIP tidak boleh kosong',
            }}
            render={({ field: { onChange, value, ...field } }) => (
              <FormControl error={Boolean(errors.no_identitas)}>
                <InputLabel sx={labelStyles}>NPM/NIP</InputLabel>
                <OutlinedInput
                  {...field}
                  value={value ?? ''} // Ensure value is always a string
                  onChange={onChange}
                  label="NPM/NIP"
                  type="text"
                  sx={inputStyles}
                />
                {errors.no_identitas && <FormHelperText>{errors.no_identitas.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            rules={{ required: 'Password wajib diisi' }}
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel sx={labelStyles}>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={togglePasswordVisibility}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={togglePasswordVisibility}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  sx={inputStyles}
                />
                {errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
              </FormControl>
            )}
          />
          {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
          <Button
            disabled={isPending}
            type="submit"
            variant="contained"
            sx={buttonStyles}
          >
            {isPending ? (
              <>
                <CircularProgress
                  size={24}
                  sx={{
                    color: '#000',
                    position: 'absolute',
                    left: '50%',
                    marginLeft: '-12px',
                  }}
                />
                <span style={{ visibility: 'hidden' }}>Masuk</span>
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </Stack>
      </form>
      <Alert sx={{ backgroundColor: '#D1F8EF' }}>
        Gunakan NIP untuk{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          Dosen dan Staff
        </Typography>{' '}
        dan NIM{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          untuk Mahasiswa
        </Typography>
      </Alert>
    </Stack>
  );
});

// Add displayName for better debugging
SignInForm.displayName = 'SignInForm';

export { SignInForm };