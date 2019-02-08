import * as React from 'react';
import {
  createStyles,
  Typography,
  withStyles,
  WithStyles,
  Chip
} from '@material-ui/core';

const styles = createStyles({
  root: {
    margin: '1em 0'
  },
  chip: {
    margin: '0.3em'
  },
  title: {
    margin: '0 0.3em'
  }
});

interface ChipSelectorProps extends WithStyles<typeof styles> {
  items: { label: string; value: string | number }[];
  title?: string;
  multi?: boolean;
  selected: Array<string | number>;
  onSelect(value: any): void;
}

class _ChipSelector extends React.Component<ChipSelectorProps> {
  onSelect(value: number | string, isSelected: boolean) {
    const { onSelect, selected, multi } = this.props;

    if (multi) {
      if (isSelected) onSelect(selected.filter(i => i != value));
      else onSelect(selected.concat([value]));
    } else {
      if (isSelected) onSelect(null);
      else onSelect(value);
    }
  }

  render() {
    const { title, items, selected, classes } = this.props;
    return (
      <div className={classes.root}>
        {title ? (
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
        ) : null}

        {items.map(i => {
          const isSelected = selected.indexOf(i.value) > -1;
          return (
            <Chip
              key={i.value}
              label={i.label}
              color={isSelected ? 'secondary' : 'default'}
              variant={isSelected ? 'default' : 'outlined'}
              onClick={() => this.onSelect(i.value, isSelected)}
              className={classes.chip}
            />
          );
        })}
      </div>
    );
  }
}

export const ChipSelector = withStyles(styles)(_ChipSelector);
