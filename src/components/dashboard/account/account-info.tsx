'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function AccountInfo(): React.JSX.Element {
  const [user, setUser] = React.useState({
    name: '',
    programStudi: '',
    noIdentitas: '',
  });

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser({
        name: userData.name,
        programStudi: userData.program_studi,
        noIdentitas: userData.no_identitas,
      });
    }
  }, []);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user.name}</Typography>
            <Typography color="text.secondary" variant="body2">
              {user.programStudi}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {user.noIdentitas}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
      </CardActions>
    </Card>
  );
}