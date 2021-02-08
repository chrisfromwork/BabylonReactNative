#include "pch.h"
#include "EngineView.h"
#include "EngineView.g.cpp"
#include "winrt/BabylonNative.h"

using namespace winrt::Windows::Devices::Input;
using namespace winrt::Windows::Foundation;
using namespace winrt::Windows::System::Threading;
using namespace winrt::Windows::UI::Core;
using namespace winrt::Windows::UI::Input;
using namespace winrt::Windows::UI::Xaml;
using namespace winrt::Windows::UI::Xaml::Input;
using namespace winrt::Windows::UI::Xaml::Media;
using namespace winrt::Windows::UI::Xaml::Controls;
using namespace winrt::BabylonNative;

namespace winrt::BabylonReactNative::implementation {
    EngineView::EngineView() {

        _revokerData.SizeChangedRevoker = SizeChanged(winrt::auto_revoke, { this, &EngineView::OnSizeChanged });

        WorkItemHandler workItemHandler([weakThis{ this->get_weak() }](IAsyncAction const& /* action */)
        {
            if (auto trueThis = weakThis.get())
            {
                auto deviceTypes = static_cast<CoreInputDeviceTypes>(
                    static_cast<uint32_t>(Windows::UI::Core::CoreInputDeviceTypes::Mouse) |
                    static_cast<uint32_t>(Windows::UI::Core::CoreInputDeviceTypes::Touch) |
                    static_cast<uint32_t>(Windows::UI::Core::CoreInputDeviceTypes::Pen));
                auto coreInput = trueThis->CreateCoreIndependentInputSource(deviceTypes);

                trueThis->_revokerData.PointerPressedRevoker = coreInput.PointerPressed(winrt::auto_revoke, { trueThis.get(), &EngineView::OnPointerPressed });
                trueThis->_revokerData.PointerMovedRevoker = coreInput.PointerMoved(winrt::auto_revoke, { trueThis.get(), &EngineView::OnPointerMoved });
                trueThis->_revokerData.PointerReleasedRevoker = coreInput.PointerReleased(winrt::auto_revoke, { trueThis.get(), &EngineView::OnPointerReleased });

                coreInput.Dispatcher().ProcessEvents(Windows::UI::Core::CoreProcessEventsOption::ProcessUntilQuit);
            }
        });

        _inputLoopWorker = ThreadPool::RunAsync(workItemHandler, WorkItemPriority::High, WorkItemOptions::TimeSliced);

        _revokerData.RenderingRevoker = CompositionTarget::Rendering(winrt::auto_revoke, [weakThis{ this->get_weak() }](auto const&, auto const&)
        {
            if (auto trueThis = weakThis.get())
            {
                trueThis->OnRendering();
            }
        });
    }

    void EngineView::OnSizeChanged(IInspectable const& /*sender*/, SizeChangedEventArgs const& args)
    {
        const auto size = args.NewSize();
        _width = static_cast<uint32_t>(size.Width);
        _height = static_cast<uint32_t>(size.Height);

        BabylonNativeInterop::UpdateView(*this, _width, _height);
    }

    void EngineView::OnPointerPressed(IInspectable const& /*sender*/, PointerEventArgs const& args)
    {
        const auto point = args.CurrentPoint();
        const auto properties = point.Properties();
        const auto deviceType = point.PointerDevice().PointerDeviceType();
        const auto position = point.Position();
        const uint32_t x = position.X < 0 ? 0 : static_cast<uint32_t>(position.X);
        const uint32_t y = position.Y < 0 ? 0 : static_cast<uint32_t>(position.Y);

        if (deviceType == PointerDeviceType::Mouse)
        {
            if (properties.IsLeftButtonPressed())
            {
                _pressedMouseButtons.insert(BabylonNativeInterop::LeftMouseButtonId());
                BabylonNativeInterop::SetMouseButtonState(BabylonNativeInterop::LeftMouseButtonId(), true, x, y);
            }

            if (properties.IsMiddleButtonPressed())
            {
                _pressedMouseButtons.insert(BabylonNativeInterop::MiddleMouseButtonId());
                BabylonNativeInterop::SetMouseButtonState(BabylonNativeInterop::MiddleMouseButtonId(), true, x, y);
            }

            if (properties.IsRightButtonPressed())
            {
                _pressedMouseButtons.insert(BabylonNativeInterop::RightMouseButtonId());
                BabylonNativeInterop::SetMouseButtonState(BabylonNativeInterop::RightMouseButtonId(), true, x, y);
            }
        }
        else
        {
            const auto pointerId = point.PointerId();
            BabylonNativeInterop::SetTouchButtonState(pointerId, true, x, y);
        }
    }

    void EngineView::OnPointerMoved(IInspectable const& /*sender*/, PointerEventArgs const& args)
    {
        const auto point = args.CurrentPoint();
        const auto deviceType = point.PointerDevice().PointerDeviceType();
        const auto position = point.Position();
        const uint32_t x = position.X < 0 ? 0 : static_cast<uint32_t>(position.X);
        const uint32_t y = position.Y < 0 ? 0 : static_cast<uint32_t>(position.Y);

        if (deviceType == PointerDeviceType::Mouse)
        {
            BabylonNativeInterop::SetMousePosition(x, y);
        }
        else
        {
            const auto pointerId = point.PointerId();
            BabylonNativeInterop::SetTouchPosition(pointerId, x, y);
        }
    }

    void EngineView::OnPointerReleased(IInspectable const& /*sender*/, PointerEventArgs const& args)
    {
        const auto point = args.CurrentPoint();
        const auto properties = point.Properties();
        const auto deviceType = point.PointerDevice().PointerDeviceType();
        const auto position = point.Position();
        const uint32_t x = position.X < 0 ? 0 : static_cast<uint32_t>(position.X);
        const uint32_t y = position.Y < 0 ? 0 : static_cast<uint32_t>(position.Y);

        if (point.PointerDevice().PointerDeviceType() == PointerDeviceType::Mouse)
        {
            if (!properties.IsLeftButtonPressed() &&
                _pressedMouseButtons.find(BabylonNativeInterop::LeftMouseButtonId()) != _pressedMouseButtons.end())
            {
                _pressedMouseButtons.erase(BabylonNativeInterop::LeftMouseButtonId());
                BabylonNativeInterop::SetMouseButtonState(BabylonNativeInterop::LeftMouseButtonId(), false, x, y);
            }

            if (!properties.IsMiddleButtonPressed() &&
                _pressedMouseButtons.find(BabylonNativeInterop::MiddleMouseButtonId()) != _pressedMouseButtons.end())
            {
                _pressedMouseButtons.erase(BabylonNativeInterop::MiddleMouseButtonId());
                BabylonNativeInterop::SetMouseButtonState(BabylonNativeInterop::MiddleMouseButtonId(), false, x, y);
            }

            if (!properties.IsRightButtonPressed() &&
                _pressedMouseButtons.find(BabylonNativeInterop::RightMouseButtonId()) != _pressedMouseButtons.end())
            {
                _pressedMouseButtons.erase(BabylonNativeInterop::RightMouseButtonId());
                BabylonNativeInterop::SetMouseButtonState(BabylonNativeInterop::RightMouseButtonId(), false, x, y);
            }
        }
        else
        {
            const auto pointerId = point.PointerId();
            BabylonNativeInterop::SetTouchButtonState(pointerId, false, x, y);
        }
    }

    void EngineView::OnRendering()
    {
        BabylonNativeInterop::RenderView();
    }
}