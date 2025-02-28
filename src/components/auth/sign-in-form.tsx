'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { z as zod } from 'zod';
import Box from '@mui/material/Box';
import { authClient } from '@/lib/auth/client';
import { useUsers } from '@/hooks/use-user';
import Link from 'next/link';

type Values = {
  no_identitas: string;
  password: string;
};

export function SignInForm(): React.JSX.Element {
  const { checkSession } = useUsers();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState<boolean>();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: {
      no_identitas: '',
      password: '',
    },
  });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      try {
        const { error, user } = await authClient.signInWithPassword(values);

        if (error) {
          setError('root', { type: 'server', message: 'Login gagal. Silakan coba lagi.' });
          ('Daftar gagal. Silahkan Coba Lagi');
          return;
        }

        if (user) {
          setTimeout(async () => {
            await checkSession?.();
            router.refresh();
          }, 1000);

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
    <Stack spacing={4}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Link href="/">
          <Box
            component="img"
            alt="Logo USK"
            src="/assets/logousk.png"
            sx={{ height: 150, width: 150 }}
          />
        </Link>
      </Box>
      <Stack spacing={1}>
        <Typography className='text-center text-white pt-2' variant="h2">Welcome</Typography>
        <Typography className='text-center text-white pt-2' variant="h5">Sistem Pengaduan & Layanan USK</Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="no_identitas"
            rules={{
              required: 'NPM/NIP wajib diisi',
              validate: (value) => {
                return value.trim() !== '' || 'NPM/NIP tidak boleh kosong';
              },
            }}
            render={({ field: { onChange, value, ...field } }) => (
              <FormControl error={Boolean(errors.no_identitas)}>
                <InputLabel sx={{ color: 'black', '&.Mui-focused': { color: 'black' } }}>NPM/NIP</InputLabel>
                <OutlinedInput
                  {...field}
                  value={value === undefined ? '' : value} // Keep it as string
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange(val); // No need to convert to number
                  }}
                  label="NPM/NIP"
                  type="text" // Change to text
                  sx={{
                    backgroundColor: 'white', // Set background color to white
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#DFF2EB', // Set border color when focused
                    },
                  }}
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
                <InputLabel sx={{ color: 'black', '&.Mui-focused': { color: 'black' } }}>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  sx={{
                    backgroundColor: 'white', // Set background color to white
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#DFF2EB', // Set border color when focused
                    },
                  }}
                />
                {errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
              </FormControl>
            )}
          />
          {errors.root && <Alert color="error">{errors.root.message}</Alert>}
          <Button
            disabled={isPending}
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#79D7BE',
              color: '#000',
              '&:hover': { bgcolor: '#B9E5E8'}
            }}
          >
            {isPending ? 'Sedang Masuk...' : 'Masuk'}
          </Button>
        </Stack>
      </form>
      <Alert sx={{ backgroundColor: '#D1F8EF' }}>
        Gunakan NIP untuk{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          Dosen dan Staff
        </Typography>{' '}
        Dan NIM{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          Untuk Mahasiswa
        </Typography>
      </Alert>
    </Stack>
  );
}