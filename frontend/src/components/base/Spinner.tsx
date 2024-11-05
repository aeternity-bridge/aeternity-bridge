import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import CircularProgress from '@mui/material/CircularProgress';

import { Typography } from '@mui/material';

const useStyles = (margin = 0, size: number) =>
    makeStyles(() =>
        createStyles({
            root: {
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
                margin,
                height: '100%',
            },
            container: {
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                margin,
            },
            icon: {
                position: 'absolute',
                width: size,
                height: size,
                opacity: 0.8,
            },
        }),
    );

interface OwnProps {
    loading: boolean;
    msg?: string;
    margin?: number;
    size?: number;
}

const CircularProgressWithText: React.FC<OwnProps> = ({ msg, loading = true, margin, size = 32 }) => {
    const classes = useStyles(margin, size / 2)();

    return loading ? (
        <div className={classes.root}>
            <div className={classes.container}>
                <CircularProgress size={size} />
            </div>
            {msg ? <Typography variant="caption">{msg}</Typography> : null}
        </div>
    ) : null;
};

export default CircularProgressWithText;
