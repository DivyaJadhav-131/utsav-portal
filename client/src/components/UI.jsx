// Accessible UI building blocks used throughout the pages.
import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../utils.js';
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (<AlertDialogPrimitive.Overlay className={cn('position-fixed position-inset-all-0 stack-order-50 background-black-50 when-state-open-animation-in when-state-closed-animation-out when-state-closed-transition-fade-out-0 when-state-open-transition-fade-in-0', className)} {...props} ref={ref} />));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (<AlertDialogPortal>
  <AlertDialogOverlay />
  <AlertDialogPrimitive.Content ref={ref} className={cn('position-fixed offset-left-1-2 offset-top-1-2 stack-order-50 width-full max-width-md translate-x-negative-1-2 translate-y-negative-1-2 corner-radius-lg background-white padding-6 box-shadow-xl transition-duration-200 when-state-open-animation-in when-state-closed-animation-out when-state-closed-transition-fade-out-0 when-state-open-transition-fade-in-0 when-state-closed-transition-zoom-out-95 when-state-open-transition-zoom-in-95', className)} {...props} />
</AlertDialogPortal>));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({ className, ...props }) => (<div className={cn('display-flex flex-direction-column children-gap-y-2', className)} {...props} />);
const AlertDialogFooter = ({ className, ...props }) => (<div className={cn('display-flex flex-direction-column-reverse element-gap-2 at-small-screen-flex-direction-row at-small-screen-justify-content-end', className)} {...props} />);
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (<AlertDialogPrimitive.Title ref={ref} className={cn('font-size-lg font-weight-semibold', className)} {...props} />));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (<AlertDialogPrimitive.Description ref={ref} className={cn('font-size-sm text-color-gray-500', className)} {...props} />));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (<AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (<AlertDialogPrimitive.Cancel ref={ref} className={cn(buttonVariants({ variant: 'outline' }), className)} {...props} />));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, };

const badgeVariants = cva('display-inline-flex align-items-center corner-radius-full border-default padding-x-2-5 padding-y-0-5 font-size-xs font-weight-semibold animated-change-colors', {
  variants: {
    variant: {
      default: 'border-color-transparent background-blue-700 text-color-white',
      secondary: 'border-color-transparent background-gray-100 text-color-gray-800',
      destructive: 'border-color-transparent background-red-100 text-color-red-700',
      outline: 'text-color-gray-700 border-color-gray-300',
      success: 'border-color-transparent background-green-100 text-color-green-700',
      warning: 'border-color-transparent background-amber-100 text-color-amber-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
export { Badge, badgeVariants };

const buttonVariants = cva('display-inline-flex align-items-center justify-content-center white-space-nowrap corner-radius-md font-size-sm font-weight-medium animated-change-colors on-keyboard-focus-outline-none on-keyboard-focus-ring-2 on-keyboard-focus-ring-blue-600 on-keyboard-focus-ring-offset-2 when-disabled-interaction-pointer-events-none when-disabled-opacity-50', {
  variants: {
    variant: {
      default: 'background-blue-700 text-color-white on-hover-background-blue-800',
      destructive: 'background-red-600 text-color-white on-hover-background-red-700',
      outline: 'border-default border-color-gray-300 background-white text-color-gray-700 on-hover-background-gray-50',
      secondary: 'background-gray-100 text-color-gray-900 on-hover-background-gray-200',
      ghost: 'on-hover-background-gray-100 text-color-gray-700',
      link: 'text-color-blue-700 underline-offset-4 on-hover-text-underline padding-0 height-auto',
      navy: 'background-blue-900 text-color-white on-hover-background-blue-950',
    },
    size: {
      default: 'height-10 padding-x-4 padding-y-2',
      sm: 'height-8 corner-radius-md padding-x-3 font-size-xs',
      lg: 'height-11 corner-radius-md padding-x-8',
      icon: 'height-10 width-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />);
});
Button.displayName = 'Button';
export { Button, buttonVariants };


const Input = React.forwardRef(({ className, type, ...props }, ref) => (<input type={type} className={cn('display-flex height-10 width-full corner-radius-md border-default border-color-gray-300 background-white padding-x-3 padding-y-2 font-size-sm placeholder-text-color-gray-400 on-keyboard-focus-outline-none on-keyboard-focus-ring-2 on-keyboard-focus-ring-blue-600 on-keyboard-focus-ring-offset-2 when-disabled-cursor-not-allowed when-disabled-opacity-50', className)} ref={ref} {...props} />));
Input.displayName = 'Input';
export { Input };

const Label = React.forwardRef(({ className, ...props }, ref) => (<LabelPrimitive.Root ref={ref} className={cn('font-size-sm font-weight-medium line-height-none when-peer-disabled-cursor-not-allowed when-peer-disabled-opacity-70', className)} {...props} />));
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };

function Skeleton({ className, ...props }) {
  return (<div className={cn('animation-pulse corner-radius-md background-gray-200', className)} {...props} />);
}
export { Skeleton };

const Textarea = React.forwardRef(({ className, ...props }, ref) => (<textarea className={cn('display-flex min-height-100px width-full corner-radius-md border-default border-color-gray-300 background-white padding-x-3 padding-y-2 font-size-sm placeholder-text-color-gray-400 on-keyboard-focus-outline-none on-keyboard-focus-ring-2 on-keyboard-focus-ring-blue-600 on-keyboard-focus-ring-offset-2 when-disabled-cursor-not-allowed when-disabled-opacity-50 resize-y', className)} ref={ref} {...props} />));
Textarea.displayName = 'Textarea';
export { Textarea };

const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (<ToastPrimitives.Viewport ref={ref} className={cn('position-fixed offset-bottom-0 offset-right-0 stack-order-100 display-flex max-height-screen width-full flex-direction-column-reverse element-gap-2 padding-4 at-small-screen-max-width-360px', className)} {...props} />));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva('hover-parent interaction-pointer-events-auto position-relative display-flex width-full align-items-center justify-content-between children-gap-x-4 overflow-hidden corner-radius-md border-default padding-4 padding-right-8 box-shadow-lg animated-change-all when-swipe-cancel-translate-x-0 when-swipe-end-translate-x-var-radix-toast-swipe-end-x when-swipe-move-translate-x-var-radix-toast-swipe-move-x when-swipe-move-no-transition when-state-open-animation-in when-state-closed-animation-out when-swipe-end-animation-out when-state-closed-transition-fade-out-80 when-state-closed-transition-slide-out-to-right-full when-state-open-transition-slide-in-from-bottom-full', {
  variants: {
    variant: {
      default: 'border-color-gray-200 background-white text-color-gray-900',
      destructive: 'border-color-red-200 background-red-50 text-color-red-800',
      success: 'border-color-green-200 background-green-50 text-color-green-800',
    },
  },
  defaultVariants: { variant: 'default' },
});
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => (<ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />));
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => (<ToastPrimitives.Close ref={ref} className={cn('position-absolute offset-right-2 offset-top-2 corner-radius-md padding-1 text-color-gray-400 on-hover-text-color-gray-600 on-focus-outline-none', className)} toast-close="" {...props}>
  <X className="height-4 width-4" />
</ToastPrimitives.Close>));
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (<ToastPrimitives.Title ref={ref} className={cn('font-size-sm font-weight-semibold', className)} {...props} />));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (<ToastPrimitives.Description ref={ref} className={cn('font-size-sm opacity-80', className)} {...props} />));
ToastDescription.displayName = ToastPrimitives.Description.displayName;
export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, };




