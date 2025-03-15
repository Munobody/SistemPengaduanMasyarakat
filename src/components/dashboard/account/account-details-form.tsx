'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Unstable_Grid2';


export function AccountDetailsForm(): React.JSX.Element {
  const [accountDetails, setAccountDetails] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setAccountDetails({
      firstName: user.name.split(' ')[0],
      lastName:user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone: user.no_identitas,

    });
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = event.target;
    setAccountDetails((prevDetails) => ({
      ...prevDetails,
      [name as string]: value,
    }));
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        // Tambahkan logika untuk menyimpan detail akun
      }}
    >
      <Card>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>First name</InputLabel>
                <OutlinedInput
                  label="First name"
                  name="firstName"
                  value={accountDetails.firstName}
                  onChange={handleChange}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Last name</InputLabel>
                <OutlinedInput
                  label="Last name"
                  name="lastName"
                  value={accountDetails.lastName}
                  onChange={handleChange}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput
                  label="Email address"
                  name="email"
                  value={accountDetails.email}
                  onChange={handleChange}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phone number</InputLabel>
                <OutlinedInput
                  label="Phone number"
                  name="phone"
                  type="tel"
                  value={accountDetails.phone}
                  onChange={handleChange}
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        {/* <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" type="submit">Save details</Button>
        </CardActions> */}
      </Card>
    </form>
  );
}