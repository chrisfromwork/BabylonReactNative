#pragma once

#include "BabylonNativeInterop.g.h"
#include <winrt/Windows.UI.Xaml.Controls.h>

namespace winrt::BabylonNative::implementation
{
    struct BabylonNativeInterop : BabylonNativeInteropT<BabylonNativeInterop>
    {
        BabylonNativeInterop() = default;
        static void Initialize(winrt::Microsoft::ReactNative::IReactContext reactContext, InitializeCompletedHandler callback);
        static void Deinitialize();
        static void UpdateView(winrt::Windows::UI::Xaml::Controls::SwapChainPanel swapChainPanel, uint32_t width, uint32_t height);
        static void RenderView();
        static void SetMouseButtonState(uint32_t buttonId, bool isDown, uint32_t x, uint32_t y);
        static void SetMousePosition(uint32_t x, uint32_t y);
        static void SetTouchButtonState(uint32_t pointerId, bool isDown, uint32_t x, uint32_t y);
        static void SetTouchPosition(uint32_t pointerId, uint32_t x, uint32_t y);

        static uint32_t LeftMouseButtonId();
        static uint32_t MiddleMouseButtonId();
        static uint32_t RightMouseButtonId();
    };
}

namespace winrt::BabylonNative::factory_implementation
{
    struct BabylonNativeInterop : BabylonNativeInteropT<BabylonNativeInterop, implementation::BabylonNativeInterop>
    {
    };
}
