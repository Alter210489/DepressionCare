import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ChevronRight, User, GraduationCap, Calendar, Mail, UserCheck, BookOpen, Building2 } from 'lucide-react';

const StudentDepressionQuestionnaire = () => {
  const [currentStep, setCurrentStep] = useState('profile');
  const [studentData, setStudentData] = useState({
    nama: '',
    fakultas: '',
    prodi: '',
    usia: '',
    jenis_kelamin: '',
    email: ''
  });
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const questions = [
    {
      text: "Perasaan sedih",
      options: [
        { label: "Saya tidak merasa sedih.", value: 0 },
        { label: "Saya merasa sedih sesekali.", value: 1 },
        { label: "Saya sering merasa sedih, terutama terkait tugas atau kegiatan kuliah.", value: 2 },
        { label: "Saya sangat sedih hampir sepanjang waktu sehingga sulit fokus belajar.", value: 3 }
      ]
    },
    {
      text: "Pandangan masa depan",
      options: [
        { label: "Saya merasa optimis dengan masa depan akademik saya.", value: 0 },
        { label: "Saya agak khawatir tentang masa depan saya di kuliah.", value: 1 },
        { label: "Saya merasa masa depan akademik saya suram.", value: 2 },
        { label: "Saya merasa tidak punya harapan untuk lulus dengan baik.", value: 3 }
      ]
    },
    {
      text: "Merasa gagal",
      options: [
        { label: "Saya tidak merasa gagal sebagai mahasiswa.", value: 0 },
        { label: "Saya merasa gagal dalam beberapa hal di kuliah.", value: 1 },
        { label: "Saya sering merasa sebagai mahasiswa yang gagal.", value: 2 },
        { label: "Saya merasa sebagai mahasiswa yang benar-benar gagal.", value: 3 }
      ]
    },
    {
      text: "Kehilangan minat",
      options: [
        { label: "Saya tetap tertarik pada kegiatan perkuliahan dan organisasi.", value: 0 },
        { label: "Saya kurang bersemangat mengikuti beberapa kegiatan kuliah.", value: 1 },
        { label: "Saya jarang merasa tertarik untuk terlibat dalam kegiatan kampus.", value: 2 },
        { label: "Saya tidak tertarik lagi pada kegiatan kampus dan akademik.", value: 3 }
      ]
    },
    {
      text: "Perasaan bersalah",
      options: [
        { label: "Saya jarang merasa bersalah atas hal-hal yang saya lakukan di kampus.", value: 0 },
        { label: "Saya kadang merasa bersalah karena tidak maksimal belajar.", value: 1 },
        { label: "Saya sering merasa bersalah kepada dosen, teman, atau keluarga.", value: 2 },
        { label: "Saya selalu merasa bersalah atas kegagalan saya sebagai mahasiswa.", value: 3 }
      ]
    },
    {
      text: "Merasa dihukum",
      options: [
        { label: "Saya tidak merasa dihukum.", value: 0 },
        { label: "Saya merasa saya bisa saja mendapatkan konsekuensi dari nilai jelek.", value: 1 },
        { label: "Saya merasa pantas mendapat hukuman karena buruknya prestasi saya.", value: 2 },
        { label: "Saya merasa dihukum oleh kegagalan akademik saya.", value: 3 }
      ]
    },
    {
      text: "Kebencian pada diri sendiri",
      options: [
        { label: "Saya tidak benci pada diri sendiri.", value: 0 },
        { label: "Saya kecewa pada diri sendiri karena hasil kuliah saya.", value: 1 },
        { label: "Saya tidak suka diri saya sendiri sebagai mahasiswa.", value: 2 },
        { label: "Saya sangat membenci diri sendiri.", value: 3 }
      ]
    },
    {
      text: "Menyalahkan diri sendiri",
      options: [
        { label: "Saya tidak sering menyalahkan diri sendiri.", value: 0 },
        { label: "Saya kadang menyalahkan diri sendiri atas nilai buruk.", value: 1 },
        { label: "Saya sering menyalahkan diri sendiri atas kegagalan belajar.", value: 2 },
        { label: "Saya selalu merasa semua masalah kuliah adalah salah saya.", value: 3 }
      ]
    },
    {
      text: "Pikiran untuk bunuh diri",
      options: [
        { label: "Saya tidak berpikir untuk bunuh diri.", value: 0 },
        { label: "Saya pernah berpikir untuk bunuh diri tetapi tidak serius.", value: 1 },
        { label: "Saya ingin bunuh diri tetapi tidak memiliki rencana.", value: 2 },
        { label: "Saya akan bunuh diri jika punya kesempatan.", value: 3 }
      ]
    },
    {
      text: "Menangis",
      options: [
        { label: "Saya jarang menangis.", value: 0 },
        { label: "Saya lebih sering menangis daripada biasanya.", value: 1 },
        { label: "Saya sering menangis karena stres kuliah.", value: 2 },
        { label: "Saya menangis terus-menerus dan sulit berhenti.", value: 3 }
      ]
    },
    {
      text: "Gelisah/iritasi",
      options: [
        { label: "Saya jarang merasa kesal.", value: 0 },
        { label: "Saya mudah kesal pada hal kecil di kampus.", value: 1 },
        { label: "Saya sering kesal dan marah pada diri sendiri atau orang lain.", value: 2 },
        { label: "Saya selalu merasa terganggu oleh hal-hal kecil.", value: 3 }
      ]
    },
    {
      text: "Kehilangan minat sosial",
      options: [
        { label: "Saya tetap mau bertemu teman.", value: 0 },
        { label: "Saya mulai menarik diri dari teman.", value: 1 },
        { label: "Saya sering menghindari pertemuan dengan teman kampus.", value: 2 },
        { label: "Saya sama sekali tidak mau bertemu orang lain.", value: 3 }
      ]
    },
    {
      text: "Kesulitan membuat keputusan",
      options: [
        { label: "Saya masih bisa membuat keputusan akademik dengan baik.", value: 0 },
        { label: "Saya sedikit bingung dalam mengambil keputusan kuliah.", value: 1 },
        { label: "Saya sering ragu menentukan pilihan di perkuliahan.", value: 2 },
        { label: "Saya tidak bisa membuat keputusan sama sekali.", value: 3 }
      ]
    },
    {
      text: "Pandangan negatif terhadap diri",
      options: [
        { label: "Saya puas dengan diri saya.", value: 0 },
        { label: "Saya sedikit kecewa dengan diri sendiri.", value: 1 },
        { label: "Saya merasa diri saya buruk sebagai mahasiswa.", value: 2 },
        { label: "Saya merasa saya sangat buruk.", value: 3 }
      ]
    },
    {
      text: "Kesulitan belajar",
      options: [
        { label: "Saya belajar dengan baik seperti biasa.", value: 0 },
        { label: "Saya merasa agak sulit konsentrasi belajar.", value: 1 },
        { label: "Saya sulit berkonsentrasi dan menyelesaikan tugas.", value: 2 },
        { label: "Saya tidak bisa belajar sama sekali.", value: 3 }
      ]
    },
    {
      text: "Gangguan tidur",
      options: [
        { label: "Tidur saya normal.", value: 0 },
        { label: "Saya sedikit sulit tidur karena stres tugas.", value: 1 },
        { label: "Saya sering terbangun di malam hari.", value: 2 },
        { label: "Saya tidak bisa tidur sama sekali.", value: 3 }
      ]
    },
    {
      text: "Kelelahan fisik",
      options: [
        { label: "Saya tidak merasa lelah berlebihan.", value: 0 },
        { label: "Saya cepat lelah saat belajar.", value: 1 },
        { label: "Saya sering merasa lelah dan lesu di kampus.", value: 2 },
        { label: "Saya terlalu lelah untuk beraktivitas.", value: 3 }
      ]
    },
    {
      text: "Penurunan nafsu makan",
      options: [
        { label: "Nafsu makan saya normal.", value: 0 },
        { label: "Nafsu makan saya sedikit menurun.", value: 1 },
        { label: "Nafsu makan saya sangat menurun.", value: 2 },
        { label: "Saya tidak nafsu makan sama sekali.", value: 3 }
      ]
    },
    {
      text: "Penurunan berat badan",
      options: [
        { label: "Berat badan saya stabil.", value: 0 },
        { label: "Saya kehilangan berat badan sedikit.", value: 1 },
        { label: "Saya kehilangan berat badan 3–4 kg.", value: 2 },
        { label: "Saya kehilangan berat badan lebih dari 5 kg.", value: 3 }
      ]
    },
    {
      text: "Kekhawatiran kesehatan",
      options: [
        { label: "Saya tidak terlalu khawatir tentang kesehatan saya.", value: 0 },
        { label: "Saya sedikit khawatir tentang kesehatan karena stres.", value: 1 },
        { label: "Saya sering cemas tentang kondisi fisik saya.", value: 2 },
        { label: "Saya merasa kondisi fisik saya buruk sekali.", value: 3 }
      ]
    },
    {
      text: "Kehilangan minat seksual",
      options: [
        { label: "Minat seksual saya normal.", value: 0 },
        { label: "Minat seksual saya sedikit berkurang.", value: 1 },
        { label: "Minat seksual saya sangat berkurang.", value: 2 },
        { label: "Saya sama sekali kehilangan minat seksual.", value: 3 }
      ]
    }
  ];

  const handleStudentDataChange = (field, value) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const isProfileComplete = () => {
    return Object.values(studentData).every(value => value.trim() !== '');
  };

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const maxScore = questions.length * 3;
    const cf = totalScore / maxScore;
    
    let level, description, resources;
    
    if (totalScore <= 13) {
      level = { text: "Minimal (Normal)", color: "text-green-600", bgColor: "bg-green-50" };
      description = "Individu tidak menunjukkan gejala depresi yang signifikan. Fluktuasi mood wajar dan masih dalam batas normal. Biasanya hanya stres ringan atau kelelahan biasa, tidak memengaruhi aktivitas harian secara signifikan.";
      resources = {
        mentalHealth: [
          "Stres ringan adalah hal wajar.",
          "Kenali mental hygiene: tidur cukup, olahraga, relasi sosial sehat.",
          "Penting untuk menjaga keseimbangan hidup-kuliah"
        ],
        recommendations: [
          "Lakukan self-monitoring berkala, isi ulang kuesioner setiap 4–6 minggu.",
          "Ikuti seminar/kampanye kesehatan mental di kampus.",
          "Bergabung dengan komunitas positif (UKM, volunteer, dll)."
        ]
      };
    } else if (totalScore <= 19) {
      level = { text: "Ringan (Mild Depression)", color: "text-yellow-600", bgColor: "bg-yellow-50" };
      description = "Menunjukkan adanya gejala depresi ringan. Biasanya muncul perasaan sedih, kehilangan minat, atau sulit tidur, tapi masih bisa menjalankan aktivitas harian. Perlu diwaspadai agar tidak berkembang menjadi depresi sedang.";
      resources = {
        mentalHealth: [
          "Latihan mindfulness 5 menit dan journaling emosi.",
          "Kenali tanda-tanda overthinking dan cara menghentikannya.",
          "Pelajari teknik manajemen stres akademik."
        ],
        recommendations: [
          "Konsultasi sukarela ke layanan konseling kampus.",
          "Ceritakan perasaan ke teman/keluarga, kurangi begadang.",
          "Self-care: tidur cukup, makan sehat, waktu tanpa gadget.",
          "Jadwalkan penilaian ulang dalam 2 minggu."
        ]
      };
    } else if (totalScore <= 28) {
      level = { text: "Sedang (Moderate Depression)", color: "text-orange-600", bgColor: "bg-orange-50" };
      description = "Gejala depresi lebih nyata dan mulai mengganggu aktivitas harian, prestasi akademik, relasi sosial, atau motivasi belajar. Biasanya perlu intervensi, misalnya konseling rutin, penanganan psikolog kampus, atau terapi psikologis.";
      resources = {
        mentalHealth: [
          "Pelajari cara mengenali gejala depresi dan kapan harus minta bantuan.",
          "Temukan cara eksplorasi emosi yang sehat.",
          "Pahami pentingnya support system dalam pemulihan."
        ],
        recommendations: [
          "Konsultasi langsung dengan konselor psikologi kampus.",
          "Diskusikan beban kuliah dengan dosen wali.",
          "Libatkan orang terdekat sebagai support system."
        ]
      };
    } else {
      level = { text: "Berat (Severe Depression)", color: "text-red-600", bgColor: "bg-red-50" };
      description = "Gejala depresi sangat signifikan, dapat mencakup keputusasaan mendalam, kehilangan motivasi total, pikiran bunuh diri, atau ketidakmampuan berfungsi secara normal dalam studi dan kehidupan sosial. Kondisi ini perlu penanganan profesional segera — konseling intensif dan mungkin perawatan medis.";
      resources = {
        mentalHealth: [
          "Meminta bantuan adalah tanda kekuatan, bukan kelemahan.",
          "Pahami perbedaan depresi klinis dan stres biasa.",
          "Ketahui bahwa pemulihan adalah proses yang membutuhkan waktu."
        ],
        recommendations: [
          "Temui konselor/psikolog kampus sesegera mungkin.",
          "Jika ada pikiran bunuh diri, hubungi keluarga/teman/layanan darurat 24 jam.",
          "Jangan menunda mencari pertolongan profesional."
        ]
      };
    }
    
    setResult({
      totalScore,
      maxScore,
      cf: cf.toFixed(2),
      level,
      description,
      resources
    });
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === questions.length) {
      calculateResult();
      setCurrentStep('result');
    }
  };

  const resetQuestionnaire = () => {
    setCurrentStep('profile');
    setStudentData({
      nama: '',
      fakultas: '',
      prodi: '',
      usia: '',
      jenis_kelamin: '',
      email: ''
    });
    setAnswers({});
    setResult(null);
  };

  if (currentStep === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Header Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Kuesioner Depresi Mahasiswa
              </h1>
              <p className="text-gray-600 text-lg">
                Silakan lengkapi data diri Anda terlebih dahulu untuk memulai assessment
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="space-y-6">
              {/* Nama Lengkap */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                    value={studentData.nama}
                    onChange={(e) => handleStudentDataChange('nama', e.target.value)}
                  />
                </div>
              </div>

              {/* Fakultas dan Program Studi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fakultas
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Contoh: Teknik"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                      value={studentData.fakultas}
                      onChange={(e) => handleStudentDataChange('fakultas', e.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Program Studi
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Contoh: Informatika"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                      value={studentData.prodi}
                      onChange={(e) => handleStudentDataChange('prodi', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Usia dan Jenis Kelamin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usia
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="number"
                      placeholder="Masukkan usia"
                      min="17"
                      max="30"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                      value={studentData.usia}
                      onChange={(e) => handleStudentDataChange('usia', e.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis Kelamin
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <select
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 appearance-none cursor-pointer"
                      value={studentData.jenis_kelamin}
                      onChange={(e) => handleStudentDataChange('jenis_kelamin', e.target.value)}
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                    value={studentData.email}
                    onChange={(e) => handleStudentDataChange('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  onClick={() => setCurrentStep('questionnaire')}
                  disabled={!isProfileComplete()}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-4 px-8 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Lanjut ke Kuesioner</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center pt-4">
                <div className="flex space-x-2">
                  <div className="w-8 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'questionnaire') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Kuesioner Depresi Mahasiswa</h1>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Peserta:</strong> {studentData.nama} | {studentData.fakultas} - {studentData.prodi}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {index + 1}. {question.text}
                  </h3>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 transition-all duration-200 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option.value}
                          onChange={(e) => handleAnswerChange(index, parseInt(e.target.value))}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setCurrentStep('profile')}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-300 transition-all duration-200"
                >
                  Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length !== questions.length}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-green-700 transition-all duration-200"
                >
                  Hitung Certainty Factor
                </button>
              </div>

              <div className="flex items-center justify-center pt-4">
                <div className="flex space-x-2">
                  <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Hasil Certainty Factor</h1>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Peserta:</strong> {studentData.nama} | {studentData.fakultas} - {studentData.prodi}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl text-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-600">Total Skor</h3>
                    <p className="text-3xl font-bold text-blue-600">{result.totalScore}</p>
                    <p className="text-sm text-gray-500">dari {result.maxScore}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-600">Certainty Factor</h3>
                    <p className="text-3xl font-bold text-green-600">{result.cf}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-600">Tingkat</h3>
                    <p className={`text-xl font-bold ${result.level.color}`}>{result.level.text}</p>
                  </div>
                </div>

                <div className={`${result.level.bgColor} p-6 rounded-lg text-left`}>
                  <h3 className={`text-xl font-bold ${result.level.color} mb-4`}>
                    {result.level.text}
                  </h3>
                  <p className="text-gray-700 mb-6">{result.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Fitur Kesehatan Mental:</h4>
                      <ul className="space-y-2">
                        {result.resources.mentalHealth.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Rekomendasi Tindak Lanjut:</h4>
                      <ul className="space-y-2">
                        {result.resources.recommendations.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={resetQuestionnaire}
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200"
                >
                  Isi Kuesioner Lagi
                </button>
              </div>

              <div className="flex items-center justify-center pt-4">
                <div className="flex space-x-2">
                  <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentDepressionQuestionnaire;