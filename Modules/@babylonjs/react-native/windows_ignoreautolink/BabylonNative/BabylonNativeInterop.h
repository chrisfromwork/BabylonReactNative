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
        static void SetPointerButtonState(uint32_t pointerId, uint32_t buttonId, bool isDown, uint32_t x, uint32_t y);
        static void SetPointerPosition(uint32_t pointerId, uint32_t x, uint32_t y);
    };
}

namespace winrt::BabylonNative::factory_implementation
{
    struct BabylonNativeInterop : BabylonNativeInteropT<BabylonNativeInterop, implementation::BabylonNativeInterop>
    {
    };
}
