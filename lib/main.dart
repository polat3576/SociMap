import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:permission_handler/permission_handler.dart';

void main() {
  runApp(const SociMapApp());
}

class SociMapApp extends StatelessWidget {
  const SociMapApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SociMap',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
      ),
      home: const MapScreen(),
    );
  }
}

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  late GoogleMapController mapController;

  // Başlangıç kamerası koordinatları: Gaziemir
  static const CameraPosition _initialPosition = CameraPosition(
    target: LatLng(38.3233, 27.1360),
    zoom: 14.5,
  );

  @override
  void initState() {
    super.initState();
    _requestLocationPermission(); // Uygulama açılır açılmaz izin iste
  }

  // Konum iznini kontrol eden ve isteyen asenkron fonksiyon
  Future<void> _requestLocationPermission() async {
    var status = await Permission.locationWhenInUse.status;
    if (!status.isGranted) {
      await Permission.locationWhenInUse.request();
    }
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SociMap - Ana Harita'),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
      ),
      body: GoogleMap(
        onMapCreated: _onMapCreated,
        initialCameraPosition: _initialPosition,
        myLocationEnabled: true,       // Kullanıcının olduğu yerde mavi nokta çıkarır
        myLocationButtonEnabled: true, // Sağ üste "Konumuma Git" butonu ekler
        zoomControlsEnabled: false,    // Ekranda yer kaplamaması için + - butonlarını gizler
      ),
    );
  }
}
