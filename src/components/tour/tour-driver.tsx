"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTourStore } from "@/stores/tour-store";
import { useTranslation } from "@/hooks/use-translation";
import { FEES } from "@/lib/fees";
import { OrderFlowModal } from "./order-flow-modal";

const STEP_ROUTES = [
  "/user", "/user", "/user", "/user", "/user", "/user",           // 0-5  dashboard
  "/user/packages",                                                  // 6    packages overview
  "/user/actions", "/user/actions", "/user/actions", "/user/actions", "/user/actions", // 7-11  actions
  "/user/packages", "/user/packages", "/user/packages",             // 12-14 packages detail
  "/user/checkout",                                                  // 15   checkout
  "/user/profile", "/user/profile", "/user/profile", "/user/profile", "/user/profile", // 16-20 profile
  "/user/consolidate", "/user/consolidate", "/user/consolidate",   // 21-23 consolidate
  "/user/checkout", "/user/checkout",                               // 24-25 checkout
];

const ORDER_FLOW_BEFORE = 6;

// Build consecutive block around a step — only steps that are sequential on the same route
function getConsecutiveBlock(step: number): number[] {
  const route = STEP_ROUTES[step];
  let start = step;
  while (start > 0 && STEP_ROUTES[start - 1] === route) start--;
  let end = step;
  while (end < STEP_ROUTES.length - 1 && STEP_ROUTES[end + 1] === route) end++;
  const result: number[] = [];
  for (let i = start; i <= end; i++) result.push(i);
  return result;
}

export function TourDriver() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const {
    isRunning,
    currentStep,
    showOrderFlow,
    nextStep,
    prevStep,
    stopTour,
    completeTour,
    openOrderFlow,
  } = useTourStore();

  const driverRef = useRef<Driver | null>(null);
  const stepRef = useRef(currentStep);
  const wasShowingOrderFlow = useRef(false);
  const clickCleanupRef = useRef<(() => void) | null>(null);

  const autoAdvanceSteps = new Set([12, 13]);

  stepRef.current = currentStep;

  const buildAllSteps = useCallback((): DriveStep[] => {
    const fmt = (key: string) =>
      t(key).replace("{fee}", `€${FEES.DAILY_DEMURRAGE.toFixed(2)}`);
    return [
      // 0-5 Dashboard
      { element: '[data-tour="dashboard-welcome"]', popover: { title: fmt("tour.step.dashboardWelcome.title"), description: fmt("tour.step.dashboardWelcome.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="dashboard-packages"]', popover: { title: fmt("tour.step.dashboardPackages.title"), description: fmt("tour.step.dashboardPackages.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="dashboard-storage"]', popover: { title: fmt("tour.step.dashboardStorage.title"), description: fmt("tour.step.dashboardStorage.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="dashboard-packagestats"]', popover: { title: fmt("tour.step.dashboardPackageStats.title"), description: fmt("tour.step.dashboardPackageStats.content"), side: "left", align: "start" } },
      { element: '[data-tour="dashboard-invoice"]', popover: { title: fmt("tour.step.dashboardInvoice.title"), description: fmt("tour.step.dashboardInvoice.content"), side: "left", align: "start" } },
      {
        element: '[data-tour="dashboard-actions"]',
        popover: {
          title: fmt("tour.step.dashboardActions.title"),
          description: fmt("tour.step.dashboardActions.content"),
          side: "top", align: "start",
          onNextClick: () => {
            driverRef.current?.destroy();
            driverRef.current = null;
            openOrderFlow();
          },
        },
      },
      // 6 Packages overview
      { element: '[data-tour="package-list"]', popover: { title: fmt("tour.step.packagesOverview.title"), description: fmt("tour.step.packagesOverview.content"), side: "top", align: "start" } },
      // 7-11 Actions
      { element: '[data-tour="new-package"]', popover: { title: fmt("tour.step.actionsPage.title"), description: fmt("tour.step.actionsPage.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="tracking-input"]', popover: { title: fmt("tour.step.tracking.title"), description: fmt("tour.step.tracking.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="carrier-select"]', popover: { title: fmt("tour.step.carrier.title"), description: fmt("tour.step.carrier.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="content-input"]', popover: { title: fmt("tour.step.contentInput.title"), description: fmt("tour.step.contentInput.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="submit-btn"]', popover: { title: fmt("tour.step.submit.title"), description: fmt("tour.step.submit.content"), side: "top", align: "start" } },
      // 12-14 Packages detail
      { element: '[data-tour="package-card"]', popover: { title: fmt("tour.step.packageCard.title"), description: fmt("tour.step.packageCard.content"), side: "top", align: "start" } },
      { element: '[data-tour="package-detail"]', popover: { title: fmt("tour.step.packageDetail.title"), description: fmt("tour.step.packageDetail.content"), side: "left", align: "start" } },
      { element: '[data-tour="package-chat"]', popover: { title: fmt("tour.step.packageChat.title"), description: fmt("tour.step.packageChat.content"), side: "left", align: "start" } },
      // 15 Checkout
      { element: '[data-tour="checkout-pay"]', popover: { title: fmt("tour.step.checkoutPay.title"), description: fmt("tour.step.checkoutPay.content"), side: "bottom", align: "start" } },
      // 16-20 Profile
      { element: '[data-tour="profile-info"]', popover: { title: fmt("tour.step.profileInfo.title"), description: fmt("tour.step.profileInfo.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="profile-address"]', popover: { title: fmt("tour.step.profileAddress.title"), description: fmt("tour.step.profileAddress.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="profile-password"]', popover: { title: fmt("tour.step.profilePassword.title"), description: fmt("tour.step.profilePassword.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="profile-subscription"]', popover: { title: fmt("tour.step.profileSubscription.title"), description: fmt("tour.step.profileSubscription.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="profile-extras"]', popover: { title: fmt("tour.step.profileExtras.title"), description: fmt("tour.step.profileExtras.content"), side: "top", align: "start" } },
      // 21-23 Consolidate
      { element: '[data-tour="consolidate-left"]', popover: { title: fmt("tour.step.consolidateLeft.title"), description: fmt("tour.step.consolidateLeft.content"), side: "right", align: "start" } },
      { element: '[data-tour="consolidate-right"]', popover: { title: fmt("tour.step.consolidateRight.title"), description: fmt("tour.step.consolidateRight.content"), side: "left", align: "start" } },
      { element: '[data-tour="consolidate-confirm"]', popover: { title: fmt("tour.step.consolidateConfirm.title"), description: fmt("tour.step.consolidateConfirm.content"), side: "top", align: "start" } },
      // 24-25 Checkout final
      { element: '[data-tour="checkout"]', popover: { title: fmt("tour.step.checkout.title"), description: fmt("tour.step.checkout.content"), side: "bottom", align: "start" } },
      { element: '[data-tour="checkout-pay"]', popover: { title: fmt("tour.step.checkoutPayFinal.title"), description: fmt("tour.step.checkoutPayFinal.content"), side: "bottom", align: "start" } },
    ];
  }, [t]);

  const startDriver = useCallback(
    (fromGlobalStep: number, attempt = 0) => {
      if (clickCleanupRef.current) {
        clickCleanupRef.current();
        clickCleanupRef.current = null;
      }
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }

      const allSteps = buildAllSteps();
      if (fromGlobalStep >= allSteps.length) {
        completeTour();
        return;
      }

      // Build consecutive block of steps for the current route
      const blockIndices = getConsecutiveBlock(fromGlobalStep);
      const blockSteps: DriveStep[] = blockIndices.map((i) => allSteps[i]);
      const relativeStart = blockIndices.indexOf(fromGlobalStep);

      // Wait for the target element
      const targetStep = blockSteps[relativeStart];
      if (targetStep?.element) {
        const el = document.querySelector(
          typeof targetStep.element === "string" ? targetStep.element : ""
        );
        if (!el && attempt < 10) {
          const timer = setTimeout(() => startDriver(fromGlobalStep, attempt + 1), 300);
          return () => clearTimeout(timer);
        }
        if (el) {
          el.scrollIntoView({ behavior: "instant", block: "center" });
        }
      }

      const d = driver({
        animate: true,
        showProgress: true,
        progressText: `{{current}} / {{total}}`,
        overlayColor: "rgb(26, 39, 68)",
        overlayOpacity: 0.45,
        stagePadding: 10,
        stageRadius: 12,
        popoverClass: "chios-tour-popover",
        steps: blockSteps,

        onHighlighted: (element, _step, opts) => {
          if (clickCleanupRef.current) {
            clickCleanupRef.current();
            clickCleanupRef.current = null;
          }

          const curGlobal = blockIndices[opts.state.activeIndex ?? 0];
          if (element && autoAdvanceSteps.has(curGlobal)) {
            const handler = () => {
              element.removeEventListener("click", handler);
              clickCleanupRef.current = null;

              const nextGlobal = curGlobal + 1;
              if (nextGlobal >= allSteps.length || !STEP_ROUTES[nextGlobal]) {
                d.destroy();
                driverRef.current = null;
                completeTour();
                return;
              }

              nextStep();
              stepRef.current = nextGlobal;

              if (STEP_ROUTES[nextGlobal] !== pathname) {
                d.destroy();
                driverRef.current = null;
                router.push(STEP_ROUTES[nextGlobal]);
              } else {
                opts.driver.moveNext();
              }
            };
            element.addEventListener("click", handler);
            clickCleanupRef.current = () => element.removeEventListener("click", handler);
            (element as HTMLElement).style.cursor = "pointer";
          }
        },

        onDeselected: (element, _step, _opts) => {
          if (clickCleanupRef.current) {
            clickCleanupRef.current();
            clickCleanupRef.current = null;
          }
          if (element) {
            (element as HTMLElement).style.cursor = "";
          }
        },

        onNextClick: (_el, _step, opts) => {
          const curGlobal = stepRef.current;
          const nextGlobal = curGlobal + 1;

          if (nextGlobal >= allSteps.length || !STEP_ROUTES[nextGlobal]) {
            d.destroy();
            driverRef.current = null;
            completeTour();
            return;
          }

          if (nextGlobal === ORDER_FLOW_BEFORE) {
            d.destroy();
            driverRef.current = null;
            openOrderFlow();
            return;
          }

          nextStep();
          stepRef.current = nextGlobal;

          if (STEP_ROUTES[nextGlobal] !== pathname) {
            d.destroy();
            driverRef.current = null;
            router.push(STEP_ROUTES[nextGlobal]);
            return;
          }

          // Same route, consecutive block → smooth advance
          opts.driver.moveNext();
        },

        onPrevClick: (_el, _step, opts) => {
          const curGlobal = stepRef.current;
          const prevGlobal = curGlobal - 1;

          if (prevGlobal < 0 || !STEP_ROUTES[prevGlobal]) return;

          prevStep();
          stepRef.current = prevGlobal;

          if (STEP_ROUTES[prevGlobal] !== pathname) {
            d.destroy();
            driverRef.current = null;
            router.push(STEP_ROUTES[prevGlobal]);
            return;
          }

          opts.driver.movePrevious();
        },

        onCloseClick: () => {
          d.destroy();
          driverRef.current = null;
          stopTour();
        },
      });

      driverRef.current = d;
      d.drive(relativeStart);
    },
    [buildAllSteps, pathname, router, nextStep, prevStep, completeTour, stopTour, openOrderFlow]
  );

  // Start/stop tour
  useEffect(() => {
    if (!isRunning) {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
      return;
    }
    if (STEP_ROUTES[currentStep] !== pathname) {
      router.push(STEP_ROUTES[currentStep]);
    }
  }, [isRunning]);

  // Handle route changes
  useEffect(() => {
    if (!isRunning || showOrderFlow) return;
    const expected = STEP_ROUTES[currentStep];
    if (expected && expected !== pathname) {
      router.push(expected);
      return;
    }
    if (clickCleanupRef.current) {
      clickCleanupRef.current();
      clickCleanupRef.current = null;
    }
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
    const timer = setTimeout(() => startDriver(currentStep), 400);
    return () => clearTimeout(timer);
  }, [pathname, isRunning]);

  // Handle order flow modal close
  useEffect(() => {
    if (wasShowingOrderFlow.current && !showOrderFlow && isRunning) {
      wasShowingOrderFlow.current = false;
      const nextIdx = ORDER_FLOW_BEFORE;
      if (nextIdx < STEP_ROUTES.length) {
        nextStep();
        stepRef.current = nextIdx;
        const targetRoute = STEP_ROUTES[nextIdx];
        if (targetRoute !== pathname) {
          router.push(targetRoute);
        }
      }
    }
    if (showOrderFlow) {
      wasShowingOrderFlow.current = true;
    }
  }, [showOrderFlow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clickCleanupRef.current) {
        clickCleanupRef.current();
        clickCleanupRef.current = null;
      }
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, []);

  if (!isRunning) return null;

  return <OrderFlowModal />;
}
