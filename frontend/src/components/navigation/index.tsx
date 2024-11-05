import React from 'react';
import { Box, Toolbar, AppBar, Divider } from '@mui/material';

import DarkLightSwitch from '../theme/DarkLightSwitch';

const NavigationBar = () => {
    return (
        <AppBar position="static" color="default">
            <Toolbar>
                <Box sx={{ flexGrow: 1 }} />

                <Divider flexItem orientation="vertical" sx={{ margin: 1 }} />
                <DarkLightSwitch />
            </Toolbar>
        </AppBar>
    );
};

export default NavigationBar;
