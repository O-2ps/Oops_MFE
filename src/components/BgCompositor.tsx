import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export interface BgCompositorRef {
  composite: (base64Png: string) => Promise<string>;
}

// 투명 PNG를 흰 배경 JPEG로 합성하는 숨겨진 WebView 컴포넌트
const BgCompositor = forwardRef<BgCompositorRef>((_, ref) => {
  const webViewRef = useRef<WebView>(null);
  const resolveRef = useRef<((result: string) => void) | null>(null);
  const readyRef = useRef(false);
  const pendingBase64Ref = useRef<string | null>(null);

  const runComposite = (base64Png: string) => {
    const js = `processImage(${JSON.stringify(base64Png)});true;`;
    webViewRef.current?.injectJavaScript(js);
  };

  useImperativeHandle(ref, () => ({
    composite: (base64Png: string) =>
      new Promise<string>((resolve) => {
        resolveRef.current = resolve;
        if (readyRef.current) {
          runComposite(base64Png);
        } else {
          pendingBase64Ref.current = base64Png;
        }
      }),
  }));

  // </script> 를 문자열 내에서 직접 쓰면 HTML 파서가 일찍 닫아버려서 분리
  const CLOSING = '</' + 'script>';
  const INIT_HTML =
    `<!DOCTYPE html><html><body><script>
    function processImage(base64) {
      var img = new Image();
      img.onload = function() {
        var c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);
        window.ReactNativeWebView.postMessage(
          c.toDataURL('image/jpeg', 0.92).split(',')[1]
        );
      };
      img.src = 'data:image/png;base64,' + base64;
    }
    window.ReactNativeWebView.postMessage('ready');
    ` + CLOSING + `</body></html>`;

  return (
    <View style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <WebView
        ref={webViewRef}
        source={{ html: INIT_HTML }}
        onMessage={(e) => {
          const data = e.nativeEvent.data;
          if (data === 'ready') {
            readyRef.current = true;
            if (pendingBase64Ref.current) {
              runComposite(pendingBase64Ref.current);
              pendingBase64Ref.current = null;
            }
          } else {
            resolveRef.current?.(data);
            resolveRef.current = null;
          }
        }}
        javaScriptEnabled
        style={{ width: 1, height: 1 }}
      />
    </View>
  );
});

export default BgCompositor;
