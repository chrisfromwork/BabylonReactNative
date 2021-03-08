#pragma once
#include "EngineView.g.h"
#include <unordered_set>

namespace winrt::BabylonReactNative::implementation {
    struct EngineView : EngineViewT<EngineView>
    {
    public:
        EngineView();
        ~EngineView();

    private:
        void OnSizeChanged(winrt::Windows::Foundation::IInspectable const& sender, winrt::Windows::UI::Xaml::SizeChangedEventArgs const& args);
        void OnLoaded(winrt::Windows::Foundation::IInspectable const& sender, winrt::Windows::UI::Xaml::RoutedEventArgs const& args);
        void OnUnloaded(winrt::Windows::Foundation::IInspectable const& sender, winrt::Windows::UI::Xaml::RoutedEventArgs const& args);
        void OnPointerPressed(winrt::Windows::Foundation::IInspectable const& sender, winrt::Windows::UI::Core::PointerEventArgs const& args);
        void OnPointerMoved(winrt::Windows::Foundation::IInspectable const& sender, winrt::Windows::UI::Core::PointerEventArgs const& args);
        void OnPointerReleased(winrt::Windows::Foundation::IInspectable const& sender, winrt::Windows::UI::Core::PointerEventArgs const& args);
        void OnRendering();

        size_t _width{ 1 };
        size_t _height{ 1 };
        winrt::Windows::Foundation::IAsyncAction _inputLoopWorker{};
        std::unordered_set<uint32_t> _pressedMouseButtons{};
        std::atomic<bool> _rendering{ false };

        struct RevokerData
        {
            winrt::Windows::UI::Xaml::FrameworkElement::SizeChanged_revoker SizeChangedRevoker{};
            winrt::Windows::UI::Xaml::FrameworkElement::Loaded_revoker LoadedRevoker{};
            winrt::Windows::UI::Xaml::FrameworkElement::Unloaded_revoker UnloadedRevoker{};
            winrt::Windows::UI::Core::CoreIndependentInputSource::PointerPressed_revoker PointerPressedRevoker{};
            winrt::Windows::UI::Core::CoreIndependentInputSource::PointerMoved_revoker PointerMovedRevoker{};
            winrt::Windows::UI::Core::CoreIndependentInputSource::PointerReleased_revoker PointerReleasedRevoker{};
            winrt::Windows::UI::Xaml::Media::CompositionTarget::Rendering_revoker RenderingRevoker{};
        };
        RevokerData _revokerData{};
    };
}

namespace winrt::BabylonReactNative::factory_implementation {

struct EngineView : EngineViewT<EngineView, implementation::EngineView> {};

} // namespace winrt::BabylonReactNative::factory_implementation