package com.umkm.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = WebView(this)
        setContentView(webView)

        webView.webViewClient = WebViewClient()
        
        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true

        // --- KONFIGURASI URL ---
        // Karena test menggunakan HP fisik dan PC dengan IP 192.168.1.13:
        val webUrl = "http://192.168.1.13:3000"
        
        // Jika sudah di-hosting ke Vercel, HAPUS tanda // di bawah dan masukkan link Vercel kamu:
        // val webUrl = "https://domain-vercel-kamu.vercel.app" 
        
        webView.loadUrl(webUrl)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
