import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { CSSInterpolation, SxProps } from '@mui/system';
import ButtonBase, { ButtonBaseProps } from '@mui/material/ButtonBase';
import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/utils';
import { unstable_composeClasses as composeClasses } from '@mui/material';
import { alpha, styled, useThemeProps, Theme } from '@mui/material/styles';
import { useForkRef } from '@mui/material/utils';
import { ExtendMui } from '../internals/models/helpers';
import { useUtils } from '../internals/hooks/useUtils';
import { DAY_SIZE, DAY_MARGIN } from '../internals/constants/dimensions';
import { PickerSelectionState } from '../internals/hooks/usePickerState';
import {
  PickersDayClasses,
  PickersDayClassKey,
  getPickersDayUtilityClass,
  pickersDayClasses,
} from './pickersDayClasses';

export interface PickersDayProps<TDate>
  extends Omit<ExtendMui<ButtonBaseProps>, 'onKeyDown' | 'onFocus' | 'onBlur'> {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<PickersDayClasses>;
  /**
   * The date to show.
   */
  day: TDate;
  /**
   * If `true`, renders as disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, today's date is rendering without highlighting with circle.
   * @default false
   */
  disableHighlightToday?: boolean;
  /**
   * If `true`, days are rendering without margin. Useful for displaying linked range of days.
   * @default false
   */
  disableMargin?: boolean;
  isAnimating?: boolean;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>, day: TDate) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>, day: TDate) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>, day: TDate) => void;
  onDaySelect: (day: TDate, isFinish: PickerSelectionState) => void;
  /**
   * If `true`, day is outside of month and will be hidden.
   */
  outsideCurrentMonth: boolean;
  /**
   * If `true`, renders as selected.
   * @default false
   */
  selected?: boolean;
  /**
   * If `true`, days that have `outsideCurrentMonth={true}` are displayed.
   * @default false
   */
  showDaysOutsideCurrentMonth?: boolean;
  /**
   * If `true`, renders as today date.
   * @default false
   */
  today?: boolean;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
}

type OwnerState = Partial<PickersDayProps<any>>;

const useUtilityClasses = (ownerState: PickersDayProps<any>) => {
  const {
    selected,
    disableMargin,
    disableHighlightToday,
    today,
    outsideCurrentMonth,
    showDaysOutsideCurrentMonth,
    classes,
  } = ownerState;

  const slots = {
    root: [
      'root',
      selected && 'selected',
      !disableMargin && 'dayWithMargin',
      !disableHighlightToday && today && 'today',
      outsideCurrentMonth && showDaysOutsideCurrentMonth && 'dayOutsideMonth',
    ],
    hiddenDaySpacingFiller: ['hiddenDaySpacingFiller'],
  };

  return composeClasses(slots, getPickersDayUtilityClass, classes);
};

const styleArg = ({ theme, ownerState }: { theme: Theme; ownerState: OwnerState }) => ({
  ...theme.typography.caption,
  width: DAY_SIZE,
  height: DAY_SIZE,
  borderRadius: '50%',
  padding: 0,
  // background required here to prevent collides with the other days when animating with transition group
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.active, theme.palette.action.hoverOpacity),
  },
  '&:focus': {
    backgroundColor: alpha(theme.palette.action.active, theme.palette.action.hoverOpacity),
    [`&.${pickersDayClasses.selected}`]: {
      willChange: 'background-color',
      backgroundColor: theme.palette.primary.dark,
    },
  },
  [`&.${pickersDayClasses.selected}`]: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    transition: theme.transitions.create('background-color', {
      duration: theme.transitions.duration.short,
    }),
    '&:hover': {
      willChange: 'background-color',
      backgroundColor: theme.palette.primary.dark,
    },
  },
  [`&.${pickersDayClasses.disabled}`]: {
    color: theme.palette.text.disabled,
  },
  ...(!ownerState.disableMargin && {
    margin: `0 ${DAY_MARGIN}px`,
  }),
  ...(ownerState.outsideCurrentMonth &&
    ownerState.showDaysOutsideCurrentMonth && {
      color: theme.palette.text.secondary,
    }),
  ...(!ownerState.disableHighlightToday &&
    ownerState.today && {
      [`&:not(.${pickersDayClasses.selected})`]: {
        border: `1px solid ${theme.palette.text.secondary}`,
      },
    }),
});

const overridesResolver = (
  props: { ownerState: OwnerState },
  styles: Record<PickersDayClassKey, CSSInterpolation>,
) => {
  const { ownerState } = props;
  return [
    styles.root,
    !ownerState.disableMargin && styles.dayWithMargin,
    !ownerState.disableHighlightToday && ownerState.today && styles.today,
    !ownerState.outsideCurrentMonth &&
      ownerState.showDaysOutsideCurrentMonth &&
      styles.dayOutsideMonth,
    ownerState.outsideCurrentMonth &&
      !ownerState.showDaysOutsideCurrentMonth &&
      styles.hiddenDaySpacingFiller,
  ];
};

const PickersDayRoot = styled(ButtonBase, {
  name: 'MuiPickersDay',
  slot: 'Root',
  overridesResolver,
})<{ ownerState: OwnerState }>(styleArg);

const PickersDayFiller = styled('div', {
  name: 'MuiPickersDay',
  slot: 'Root',
  overridesResolver,
})<{ ownerState: OwnerState }>(({ theme, ownerState }) => ({
  ...styleArg({ theme, ownerState }),
  // visibility: 'hidden' does not work here as it hides the element from screen readers as well
  opacity: 0,
}));

const noop = () => {};

type PickersDayComponent = (<TDate>(
  props: PickersDayProps<TDate> & React.RefAttributes<HTMLButtonElement>,
) => JSX.Element) & { propTypes?: any };

const PickersDayRaw = React.forwardRef(function PickersDay<TDate>(
  inProps: PickersDayProps<TDate>,
  forwardedRef: React.Ref<HTMLButtonElement>,
) {
  const props = useThemeProps<Theme, PickersDayProps<TDate>, 'MuiPickersDay'>({
    props: inProps,
    name: 'MuiPickersDay',
  });

  const {
    autoFocus = false,
    className,
    day,
    disabled = false,
    disableHighlightToday = false,
    disableMargin = false,
    hidden,
    isAnimating,
    onClick,
    onDaySelect,
    onFocus = noop,
    onBlur = noop,
    onKeyDown = noop,
    onMouseDown,
    outsideCurrentMonth,
    selected = false,
    showDaysOutsideCurrentMonth = false,
    children,
    today: isToday = false,
    ...other
  } = props;
  const ownerState = {
    ...props,
    autoFocus,
    disabled,
    disableHighlightToday,
    disableMargin,
    selected,
    showDaysOutsideCurrentMonth,
    today: isToday,
  };

  const classes = useUtilityClasses(ownerState);

  const utils = useUtils<TDate>();
  const ref = React.useRef<HTMLButtonElement>(null);
  const handleRef = useForkRef(ref, forwardedRef);

  // Since this is rendered when a Popper is opened we can't use passive effects.
  // Focusing in passive effects in Popper causes scroll jump.
  useEnhancedEffect(() => {
    if (autoFocus && !disabled && !isAnimating && !outsideCurrentMonth) {
      // ref.current being null would be a bug in MUI
      ref.current!.focus();
    }
  }, [autoFocus, disabled, isAnimating, outsideCurrentMonth]);

  // For day outside of current month, move focus from mouseDown to mouseUp
  // Goal: have the onClick ends before sliding to the new month
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onMouseDown) {
      onMouseDown(event);
    }
    if (outsideCurrentMonth) {
      event.preventDefault();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onDaySelect(day, 'finish');
    }

    if (outsideCurrentMonth) {
      event.currentTarget.focus();
    }

    if (onClick) {
      onClick(event);
    }
  };

  if (outsideCurrentMonth && !showDaysOutsideCurrentMonth) {
    return (
      <PickersDayFiller
        className={clsx(classes.root, classes.hiddenDaySpacingFiller, className)}
        ownerState={ownerState}
        role={other.role}
      />
    );
  }

  return (
    <PickersDayRoot
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      ref={handleRef}
      centerRipple
      data-mui-test="day"
      disabled={disabled}
      tabIndex={selected ? 0 : -1}
      onKeyDown={(event) => onKeyDown(event, day)}
      onFocus={(event) => onFocus(event, day)}
      onBlur={(event) => onBlur(event, day)}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      {...other}
    >
      {!children ? utils.format(day, 'dayOfMonth') : children}
    </PickersDayRoot>
  );
});

export const areDayPropsEqual = (
  prevProps: PickersDayProps<any>,
  nextProps: PickersDayProps<any>,
) => {
  return (
    prevProps.autoFocus === nextProps.autoFocus &&
    prevProps.isAnimating === nextProps.isAnimating &&
    prevProps.today === nextProps.today &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.selected === nextProps.selected &&
    prevProps.disableMargin === nextProps.disableMargin &&
    prevProps.showDaysOutsideCurrentMonth === nextProps.showDaysOutsideCurrentMonth &&
    prevProps.disableHighlightToday === nextProps.disableHighlightToday &&
    prevProps.className === nextProps.className &&
    prevProps.outsideCurrentMonth === nextProps.outsideCurrentMonth &&
    prevProps.onFocus === nextProps.onFocus &&
    prevProps.onBlur === nextProps.onBlur &&
    prevProps.onDaySelect === nextProps.onDaySelect
  );
};

PickersDayRaw.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * The date to show.
   */
  day: PropTypes.any.isRequired,
  /**
   * If `true`, renders as disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, today's date is rendering without highlighting with circle.
   * @default false
   */
  disableHighlightToday: PropTypes.bool,
  /**
   * If `true`, days are rendering without margin. Useful for displaying linked range of days.
   * @default false
   */
  disableMargin: PropTypes.bool,
  isAnimating: PropTypes.bool,
  onBlur: PropTypes.func,
  onDaySelect: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  /**
   * If `true`, day is outside of month and will be hidden.
   */
  outsideCurrentMonth: PropTypes.bool.isRequired,
  /**
   * If `true`, renders as selected.
   * @default false
   */
  selected: PropTypes.bool,
  /**
   * If `true`, days that have `outsideCurrentMonth={true}` are displayed.
   * @default false
   */
  showDaysOutsideCurrentMonth: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * If `true`, renders as today date.
   * @default false
   */
  today: PropTypes.bool,
} as any;

/**
 *
 * Demos:
 *
 * - [Date Picker](https://mui.com/x/react-date-pickers/date-picker/)
 *
 * API:
 *
 * - [PickersDay API](https://mui.com/x/api/date-pickers/pickers-day/)
 */
export const PickersDay = React.memo(PickersDayRaw, areDayPropsEqual) as PickersDayComponent;
